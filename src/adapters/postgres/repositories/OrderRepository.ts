import { TOrder, TOrderWithItems, TOrderCreate, TOrderItemCreate } from "../../../core/entities/order/order";
import { OrderRepository as IOrderRepository } from "../../../core/repositories/order";
import Repository from "./Repository";

/**
 * Helper function to map Prisma product (with product_master) to flat product object
 * This maintains backward compatibility with response mappers
 */
function mapProductFromPrisma(prismaProduct: any) {
	if (!prismaProduct) return null;
	
	return {
		...prismaProduct,
		name: prismaProduct.product_master?.name || '',
		category: prismaProduct.product_master?.category || null,
		// Remove product_master from the result to avoid confusion
		product_master: undefined,
	};
}

export default class OrderRepository
	extends Repository<TOrder>
	implements IOrderRepository
{
	constructor() {
		super("order");
	}

	/**
	 * Get employee assigned to outlet today
	 */
	async getEmployeeAssignedToday(outletId: number): Promise<number | null> {
		const today = new Date();
		const startOfDay = new Date(today);
		startOfDay.setHours(0, 0, 0, 0);
		
		const endOfDay = new Date(today);
		endOfDay.setHours(23, 59, 59, 999);

		const assignment = await this.prisma.outletEmployee.findFirst({
			where: {
				outlet_id: outletId,
				is_active: true,
				assigned_at: {
					gte: startOfDay,
					lte: endOfDay,
				},
			},
			orderBy: {
				assigned_at: 'desc',
			},
		});

		return assignment?.employee_id || null;
	}

	/**
	 * Get outlet location by ID
	 */
	async getOutletLocation(outletId: number): Promise<string | null> {
		const outlet = await this.prisma.outlet.findUnique({
			where: { id: outletId },
			select: { location: true },
		});

		return outlet?.location || null;
	}

	/**
	 * Get outlet code by ID
	 */
	async getOutletCode(outletId: number): Promise<string | null> {
		const outlet = await this.prisma.outlet.findUnique({
			where: { id: outletId },
			select: { code: true },
		});

		return outlet?.code || null;
	}

	/**
	 * Get next sequential order number for outlet
	 */
	async getNextOrderSequence(outletId: number): Promise<number> {
		const count = await this.getModel().count({
			where: { outlet_id: outletId },
		});

		return count + 1;
	}

	/**
	 * Get product price by ID
	 */
	async getProductPrice(productId: number): Promise<number | null> {
		const product = await this.prisma.product.findUnique({
			where: { id: productId },
			select: { price: true },
		});

		return product?.price || 0;
	}

	/**
	 * Get available stock for product at outlet (ProductStock - approved outlet requests for today)
	 */
	async getAvailableStockForOutlet(productId: number, outletId: number): Promise<number> {
		const today = new Date();
		const endOfDay = new Date(today);
		endOfDay.setHours(23, 59, 59, 999);

		// Calculate total stock IN: all approved requests up to today
		const totalStockInData = await this.prisma.outletProductRequest.aggregate({
			where: {
				outlet_id: outletId,
				product_id: productId,
				status: 'APPROVED',
				createdAt: {
					lte: endOfDay,
				},
			},
			_sum: {
				approval_quantity: true,
			},
		});
		const totalStockIn = totalStockInData._sum?.approval_quantity || 0;

		// Calculate total SOLD: all order items up to today
		const totalSoldData = await this.prisma.orderItem.aggregate({
			where: {
				product_id: productId,
				order: {
					outlet_id: outletId,
					createdAt: {
						lte: endOfDay,
					},
				},
			},
			_sum: {
				quantity: true,
			},
		});
		const totalSold = totalSoldData._sum?.quantity || 0;

		// Calculate remaining stock: total received - total sold
		const remainingStock = totalStockIn - totalSold;

		return remainingStock;
	}

	/**
	 * Create order with items in a transaction
	 */
	async createOrderWithItems(
		orderData: TOrderCreate,
		items: TOrderItemCreate[]
	): Promise<TOrderWithItems> {
		const result = await this.prisma.$transaction(async (tx) => {
			// Create the order
			const order = await tx.order.create({
				data: {
					outlet_id: orderData.outletId,
					outlet_location: orderData.outletLocation,
					invoice_number: orderData.invoiceNumber,
					employee_id: orderData.employeeId,
					payment_method: orderData.paymentMethod,
					total_amount: orderData.totalAmount,
					status: orderData.status,
					is_active: true,
				},
			});

			// Create order items with nested items
			const orderItems = await Promise.all(
				items.map(async (item) => {
					// Create parent item
					const parentItem = await tx.orderItem.create({
						data: {
							order_id: order.id,
							product_id: item.productId,
							quantity: item.quantity,
							price: item.price,
							is_active: true,
						},
					});

					// Create sub items (children) if exists
					const subItemsData = [];
					if (item.subItems && item.subItems.length > 0) {
						const createdSubItems = await Promise.all(
							item.subItems.map((subItem) =>
								tx.orderItem.create({
									data: {
										order_id: order.id,
										product_id: subItem.productId,
										quantity: subItem.quantity,
										price: subItem.price,
										order_item_root_id: parentItem.id, // Link to parent
										is_active: true,
									},
								})
							)
						);
						subItemsData.push(...createdSubItems);
					}

					return { ...parentItem, sub_items: subItemsData };
				})
			);

			// Return mapped entity with items
			return {
				id: order.id.toString(),
				outletId: order.outlet_id,
				outletLocation: order.outlet_location,
				invoiceNumber: order.invoice_number,
				employeeId: order.employee_id,
				paymentMethod: order.payment_method,
				totalAmount: order.total_amount,
				status: order.status,
				isActive: order.is_active,
				createdAt: order.createdAt,
				updatedAt: order.updatedAt,
				items: orderItems.map(item => ({
					id: item.id.toString(),
					orderId: item.order_id.toString(),
					productId: item.product_id,
					quantity: item.quantity,
					price: item.price,
					orderItemRootId: item.order_item_root_id,
					subItems: item.sub_items?.map(subItem => ({
						id: subItem.id.toString(),
						orderId: subItem.order_id.toString(),
						productId: subItem.product_id,
						quantity: subItem.quantity,
						price: subItem.price,
						orderItemRootId: subItem.order_item_root_id,
						isActive: subItem.is_active,
						createdAt: subItem.createdAt,
						updatedAt: subItem.updatedAt,
					})),
					isActive: item.is_active,
					createdAt: item.createdAt,
					updatedAt: item.updatedAt,
				})),
			};
		});

		return result;
	}

	/**
	 * Get all orders with items and product details (for list)
	 */
	async getAllOrdersWithDetails(page: number = 1, limit: number = 10) {
		const skip = (page - 1) * limit;

		const [orders, total] = await Promise.all([
			this.prisma.order.findMany({
				where: { is_active: true },
				include: {
					items: {
						include: {
							product: {
								include: {
									product_master: { include: { category: true } },
								},
							},
						},
					},
				},
				orderBy: { createdAt: 'desc' },
				skip,
				take: limit,
			}),
			this.getModel().count({ where: { is_active: true } }),
		]);

		// Map products to flat structure
		const mappedOrders = orders.map(order => ({
			...order,
			items: order.items.map(item => ({
				...item,
				product: mapProductFromPrisma(item.product),
			})),
		}));

		return {
			orders: mappedOrders,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	/**
	 * Get orders by outlet with items and product details (for list)
	 */
	async getOrdersByOutlet(outletId: number, page: number = 1, limit: number = 10) {
		const skip = (page - 1) * limit;

		const [orders, total] = await Promise.all([
			this.prisma.order.findMany({
				where: { 
					is_active: true,
					outlet_id: outletId,
				},
				include: {
					outlet: true,
					employee: true,
					items: {
						where: {
							order_item_root_id: null, // Only get parent items
						},
						include: {
							product: {
								include: {
									product_master: { include: { category: true } },
								},
							},
							sub_items: {
								include: {
									product: {
										include: {
											product_master: { include: { category: true } },
										},
									},
								},
							},
						},
					},
				},
				orderBy: { createdAt: 'desc' },
				skip,
				take: limit,
			}),
			this.getModel().count({ 
				where: { 
					is_active: true,
					outlet_id: outletId,
				},
			}),
		]);

		// Map products to flat structure
		const mappedOrders = orders.map(order => ({
			...order,
			items: order.items.map(item => ({
				...item,
				product: mapProductFromPrisma(item.product),
				sub_items: item.sub_items?.map(subItem => ({
					...subItem,
					product: mapProductFromPrisma(subItem.product),
				})),
			})),
		}));

		return {
			orders: mappedOrders,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	/**
	 * Get single order with full details (outlet, employee, items with products)
	 */
	async getOrderById(orderId: number) {
		const order = await this.prisma.order.findUnique({
			where: { id: orderId },
			include: {
				outlet: true,
				employee: true,
				items: {
					where: {
						order_item_root_id: null, // Only get parent items
					},
					include: {
						product: {
							include: {
								product_master: { include: { category: true } },
							},
						},
						sub_items: {
							include: {
								product: {
									include: {
										product_master: { include: { category: true } },
									},
								},
							},
						},
					},
				},
			},
		});

		if (!order) return null;

		// Map products to flat structure
		return {
			...order,
			items: order.items.map(item => ({
				...item,
				product: mapProductFromPrisma(item.product),
				sub_items: item.sub_items?.map(subItem => ({
					...subItem,
					product: mapProductFromPrisma(subItem.product),
				})),
			})),
		};
	}

	/**
	 * Get single order for WebSocket broadcast (with category for grouping)
	 */
	async getOrderForBroadcast(orderId: number) {
		const order = await this.prisma.order.findUnique({
			where: { id: orderId },
			include: {
				outlet: true,
				employee: true,
				items: {
					include: {
						product: {
							include: {
								product_master: {
									include: {
										category: true,
									},
								},
							},
						},
					},
				},
			},
		});

		if (!order) return null;

		// Map products to flat structure
		return {
			...order,
			items: order.items.map(item => ({
				...item,
				product: mapProductFromPrisma(item.product),
			})),
		};
	}
}
