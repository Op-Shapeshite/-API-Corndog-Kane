
import express from 'express';
import { validate } from '../../validations/validate.middleware';
import {
  createProductSchema,
  updateProductSchema,
  deleteProductSchema,
  productStockInSchema
} from '../../validations/product.validation';
import { getPaginationSchema } from '../../validations/pagination.validation';
import { ProductController } from '../../controllers/ProductController';
import ProductService from '../../../../core/services/ProductService';
import { ProductRepository } from '../../../../adapters/postgres/repositories/ProductRepository';
import { ProductResponseMapper } from '../../../../mappers/response-mappers/ProductResponseMapper';
import { storage } from '../../../../policies/uploadImages';
import { authMiddleware } from '../../../../policies/authMiddleware';
import { permissionMiddleware } from '../../../../policies/permissionMiddleware';

const router = express.Router();

const productController = new ProductController();
const productService = new ProductService(new ProductRepository());

/**
 * @route GET /api/v1/products
 * @access ADMIN | SUPERADMIN | WAREHOUSE | OUTLET
 */
router.get(
  "/",
  authMiddleware,
  permissionMiddleware(['products:read']),
  validate(getPaginationSchema),
  productController.findAll(
    productService,
    ProductResponseMapper
  )
);

/**
 * @route GET /api/v1/products/stock
 * @access WAREHOUSE | ADMIN | SUPERADMIN
 */
router.get(
  "/stock",
  authMiddleware,
  permissionMiddleware(['warehouse:product-stock:read']),
  validate(getPaginationSchema),
  productController.getStocksList()
);

/**
 * @route POST /api/v1/products/in
 * @access WAREHOUSE | ADMIN | SUPERADMIN
 */
router.post(
  "/in",
  authMiddleware,
  permissionMiddleware(['warehouse:product-stock:in']),
  validate(productStockInSchema),
  productController.addStockIn
);

/**
 * @route POST /api/v1/products
 * @access ADMIN | SUPERADMIN
 */
router.post(
  "/",
  authMiddleware,
  permissionMiddleware(['products:create']),
  storage('products')('image_path'),
  validate(createProductSchema),
  productController.createProduct
);

/**
 * @route PUT /api/v1/products/:id
 * @access ADMIN | SUPERADMIN
 */
router.put('/:id',
  authMiddleware,
  permissionMiddleware(['products:update']),
  storage('products')('image_path'),
  validate(updateProductSchema),
  productController.updateProduct
);

/**
 * @route DELETE /api/v1/products/:id
 * @access ADMIN | SUPERADMIN
 */
router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware(['products:delete']),
  validate(deleteProductSchema),
  productController.deleteProduct
);

/**
 * @route GET /api/v1/products/:id/detail
 * @access ADMIN | SUPERADMIN
 */
router.get(
  "/:id/detail",
  authMiddleware,
  permissionMiddleware(['products:read']),
  productController.getDetailedProduct
);

/**
 * @route POST /api/v1/products/:id/materials
 * @access ADMIN | SUPERADMIN
 */
router.post('/:id/materials', 
  authMiddleware,
  permissionMiddleware(['products:update']),
  productController.assignMaterialsToProduct
);

export default router;