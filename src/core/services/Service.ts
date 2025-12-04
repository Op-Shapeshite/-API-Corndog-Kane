import { TOutletAssignment } from "../entities/outlet/assignment";
import { TOutlet, TOutletWithSettings } from "../entities/outlet/outlet";
import { TRole } from "../entities/user/role";
import { TUser } from "../entities/user/user";
import { TEmployee } from "../entities/employee/employee";
import Repository, { PaginationResult, SearchConfig, FilterObject } from "../repositories/Repository";
import { TCategory } from "../entities/product/category";
import { TSupplier, TSupplierWithID } from "../entities/suplier/suplier";
import { TMaterial, TMaterialWithID } from "../entities/material/material";
import { TOutletProductRequest, TOutletMaterialRequest } from "../entities/outlet/request";
import { TOrder } from "../entities/order/order";
import { TProduct, TProductWithID } from "../entities/product/product";
import { TMasterProduct, TMasterProductWithID } from "../entities/product/masterProduct";
import { TPayroll } from "../entities/payroll/payroll";

export type TEntity =
	| TUser
	| TOutlet
	| TRole
	| TEmployee
	| TOutletAssignment
	| TOutletWithSettings
	| TCategory
	| TSupplier
	| TSupplierWithID
	| TMaterial
	| TMaterialWithID
	| TOutletProductRequest
	| TOutletMaterialRequest
	| TOrder
	| TProduct
	| TProductWithID
	| TMasterProduct
	| TMasterProductWithID
	| TPayroll;

export class Service<T extends TEntity> {
	repository: Repository<T>;
	constructor(repository: Repository<T>) {
		this.repository = repository;
	}
	async findById(id: string): Promise<T | null> {
		return this.repository.getById(id);
	}
	
	async findAll(
		page: number = 1,
		limit: number = 10,
		search?: SearchConfig[],
		filters?: FilterObject,
		orderBy?: Record<string, 'asc' | 'desc'>,
		outletId?: number
	): Promise<PaginationResult<T>> {

		const combinedFilters = outletId 
			? { ...filters, outlet_id: outletId }
			: filters;
		
		return this.repository.getAll(page, limit, search, combinedFilters, orderBy);
	}
	
	async create(item: T): Promise<T> {
		return this.repository.create(item);
	}
	
	async update(id: string, item: Partial<T>): Promise<T> {
		return this.repository.update(id, item);
	}
	
	/**
	 * Soft delete - marks record as deleted without removing from database
	 * Sets is_active = false and deleted_at = current timestamp
	 */
	async delete(id: string): Promise<void> {
		return this.repository.softDelete(id);
	}
	
	/**
	 * Hard delete - permanently removes record from database
	 * WARNING: This cannot be undone. Consider using delete() (soft delete) instead.
	 */
	async hardDelete(id: string): Promise<void> {
		return this.repository.delete(id);
	}
}