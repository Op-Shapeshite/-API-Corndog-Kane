import { Request, Response } from "express";
import {ProductRepository} from "../../../adapters/postgres/repositories/ProductRepository";
import { TMetadataResponse } from "../../../core/entities/base/response";
import { TProductGetResponse, TProductWithID, TProductInventoryGetResponse, TProductStockInResponse } from "../../../core/entities/product/product";
import ProductService from "../../../core/services/ProductService";
import Controller from "./Controller";
import { ProductResponseMapper } from "../../../mappers/response-mappers/ProductResponseMapper";
import { ProductStockResponseMapper } from "../../../mappers/response-mappers/ProductStockResponseMapper";
import { ProductStockInResponseMapper } from "../../../mappers/response-mappers/ProductStockInResponseMapper";

import fs from "fs";
import path from "path";

// Legacy interface for product create/update to maintain API compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LegacyProductInput = any;

export class ProductController extends Controller<TProductGetResponse | TProductStockInResponse | TProductInventoryGetResponse, TMetadataResponse> {
  private productService: ProductService;

  constructor() {
    super();
    this.productService = new ProductService(new ProductRepository());
  }
  createProduct = async (req: Request, res: Response) => {
    const { name, description, price, hpp, category_id } = req.body;
    const imagePath = req.file ? req.file.filename : null;

    try {
      const newProduct = await this.productService.create({
        name,
        description,
        price: parseFloat(price),
        hpp: hpp ? parseFloat(hpp) : undefined,
        categoryId: parseInt(category_id, 10),
        imagePath,
        isActive: true,
      } as LegacyProductInput);

      return this.getSuccessResponse(
        res,
        {
          data: ProductResponseMapper.toListResponse(newProduct as TProductWithID),
          
          metadata: {} as TMetadataResponse,
        },
        "Product created successfully"
      );
    } catch (error) {
      console.error("Error creating product:", error);
      return this.handleError(res,
      
        error,
        "Failed to create product",
        500,
        {} as TProductGetResponse,
        {} as TMetadataResponse

      );
    }
  }
  updateProduct = async (req: Request, res: Response) => {
    const productId = req.params.id;
    const { name, description, price, category_id, is_active } = req.body;
    
    const imagePath = req.file ? req.file.filename : null;

    try {
      //remove old image if new image is uploaded
      const existingProduct = await this.productService.findById(productId);
      if(imagePath){
        if(existingProduct && existingProduct.imagePath){
          const oldImagePath = path.join(process.cwd(), 'public', 'products', existingProduct.imagePath);
          fs.unlink(oldImagePath, (err) => {
            if (err) {
              console.error("Error deleting old image:", err);
            } else {
              console.log("Old image deleted successfully");
            }
          });
        }
      }
      const updatedProduct = await this.productService.update(productId, {
        name,
        description,
        price: price !== undefined ? parseFloat(price) : undefined,
        categoryId: category_id !== undefined ? parseInt(category_id, 10) : undefined,
        imagePath: imagePath !== null ? imagePath : existingProduct?.imagePath,
        isActive: is_active !== undefined ? Boolean(is_active) : undefined,
      } as LegacyProductInput);

      return this.getSuccessResponse(
        res,
        {
          data: ProductResponseMapper.toListResponse(updatedProduct as TProductWithID),
          metadata: {} as TMetadataResponse,
        },
        "Product updated successfully"
      );
    } catch (error) {
      console.error("Error updating product:", error);
      return this.handleError(
        res,
        error,
        "Failed to update product",
        500,
        {} as TProductGetResponse,
        {} as TMetadataResponse
      );
    }
  }

  deleteProduct = async (req: Request, res: Response) => {
    const productId = req.params.id ;

    try {
      const existingProduct = await this.productService.findById(productId);
      if (existingProduct && existingProduct.imagePath) {
        const oldImagePath = path.join(process.cwd(), 'public', 'products', existingProduct.imagePath);
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            console.error("Error deleting old image:", err);
          } else {
            console.log("Old image deleted successfully");
          }
        });
      }
      await this.productService.delete(productId);

      return this.getSuccessResponse(
        res,
        {
          data: {} as TProductGetResponse,
          metadata: {} as TMetadataResponse,
        },
        "Product deleted successfully"
      );
    } catch (error) {
      console.error("Error deleting product:", error);
      return this.handleError(
        res,
        error,
        "Failed to delete product",
        500,
        {} as TProductGetResponse,
        {} as TMetadataResponse
      );
    }
  };

  getStocksList = () => {
    return async (req: Request, res: Response) => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const { data, total } = await this.productService.getStocksList(page, limit);
      const mappedResults: TProductInventoryGetResponse[] = data.map(item => 
        ProductStockResponseMapper.toResponse(item)
      );
      
      const metadata: TMetadataResponse = {
        page,
        limit,
        total_records: total,
        total_pages: Math.ceil(total / limit),
      };
      
      return this.getSuccessResponse(
        res,
        {
          data: mappedResults,
          metadata,
        },
        "Product stocks inventory retrieved successfully"
      );
    };
  }

  addStockIn = async (req: Request, res: Response) => {
    try {
      const { product_id, master_product_id, quantity, unit_quantity, products } = req.body;
      const productRepo = new ProductRepository();

      let finalProductId: number;
      let finalMasterProductId: number;

      // Case 1: Create new master product if products object provided
      if (products && products.name && products.category_id) {
        const prisma = productRepo['prisma'];
        const newMasterProduct = await prisma.productMaster.create({
          data: {
            name: products.name,
            category_id: products.category_id,
            is_active: true,
          },
        });
        finalMasterProductId = newMasterProduct.id;

        // Create default product for this master
        const newProduct = await prisma.product.create({
          data: {
            product_master_id: newMasterProduct.id,
            price: 0, // Default price, can be updated later
            is_active: true,
          },
        });
        finalProductId = newProduct.id;
      }
      // Case 2: Use master_product_id to get product
      else if (master_product_id) {
        const prisma = productRepo['prisma'];
        // Find any product with this master_product_id
        const product = await prisma.product.findFirst({
          where: { product_master_id: master_product_id },
        });
        
        if (!product) {
          throw new Error(`No product found for master_product_id ${master_product_id}`);
        }
        
        finalProductId = product.id;
        finalMasterProductId = master_product_id;
      }
      // Case 3: Use product_id directly
      else if (product_id) {
        const prisma = productRepo['prisma'];
        const product = await prisma.product.findUnique({
          where: { id: product_id },
          select: { product_master_id: true },
        });
        
        if (!product) {
          throw new Error(`Product with ID ${product_id} not found`);
        }
        
        finalProductId = product_id;
        finalMasterProductId = product.product_master_id;
      } else {
        throw new Error('Either product_id, master_product_id, or products must be provided');
      }

      // Get product inventories for this master product
      const prisma = productRepo['prisma'];
      const inventories = await prisma.productInventory.findMany({
        where: { product_id: finalMasterProductId },
        include: {
          material: true,
        },
      });

      // Create material_out for each inventory
      for (const inventory of inventories) {
        const materialOutQuantity = quantity * inventory.quantity;
        
        await prisma.materialOut.create({
          data: {
            material_id: inventory.material_id,
            quantity: materialOutQuantity,
            quantity_unit: unit_quantity || 'pcs',
            used_at: new Date(),
          },
        });
      }

      // Create product stock in record
      const entity = await this.productService.addStockIn({
        product_id: finalProductId,
        quantity,
        unit_quantity: unit_quantity || 'pcs',
      });

      // Map entity to response using mapper
      const responseData = ProductStockInResponseMapper.toResponse(entity);

      return this.getSuccessResponse(
        res,
        {
          data: responseData,
          metadata: {} as TMetadataResponse,
        },
        "Product stock in added successfully and materials deducted"
      );
    } catch (error) {
      console.error("Error adding product stock in:", error);
      return this.handleError(
        res,
        error,
        "Failed to add product stock in",
        500,
        {} as TProductStockInResponse,
        {} as TMetadataResponse
      );
    }
  }

  /**
   * Get product detail with materials
   */
  getProductDetail = async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);
      const productRepo = new ProductRepository();
      const productWithMaterials = await productRepo.getProductWithMaterials(productId);

      if (!productWithMaterials) {
        return this.handleError(
          res,
          new Error("Product not found"),
          "Product not found",
          404,
          {} as TProductGetResponse,
          {} as TMetadataResponse
        );
      }

      // Map to response format
      const responseData: TProductGetResponse = {
        id: productWithMaterials.id,
        name: productWithMaterials.product_master.name,
        image_path: productWithMaterials.image_path,
        description: productWithMaterials.description,
        price: productWithMaterials.price,
        hpp: productWithMaterials.hpp,
        category: productWithMaterials.product_master.category ? {
          id: productWithMaterials.product_master.category.id,
          name: productWithMaterials.product_master.category.name,
          is_active: productWithMaterials.product_master.category.is_active,
        } : null,
        is_active: productWithMaterials.is_active,
        materials: productWithMaterials.materials,
        created_at: productWithMaterials.createdAt.toISOString(),
        updated_at: productWithMaterials.updatedAt.toISOString(),
      };

      return this.getSuccessResponse(
        res,
        {
          data: responseData,
          metadata: {} as TMetadataResponse,
        },
        "Product detail retrieved successfully"
      );
    } catch (error) {
      console.error("Error getting product detail:", error);
      return this.handleError(
        res,
        error,
        "Failed to get product detail",
        500,
        {} as TProductGetResponse,
        {} as TMetadataResponse
      );
    }
  }
}