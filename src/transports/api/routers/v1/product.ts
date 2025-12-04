
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
import { permissionMiddleware } from '../../../../policies';

const router = express.Router();

const productController = new ProductController();
const productService = new ProductService(new ProductRepository());

router.get(
  "/",
  authMiddleware,
  permissionMiddleware(['products:read']),
  validate(getPaginationSchema),
  productController.findAllWithSearch(
    productService,
    ProductResponseMapper,
    'product'
  )
);

// GET stocks inventory
router.get(
  "/stock",
  authMiddleware,
  permissionMiddleware(['products:stocks:read']),
  validate(getPaginationSchema),
  productController.getStocksList()
);

// POST stock in with PRODUCTION source
router.post(
  "/in",
  authMiddleware,
  permissionMiddleware(['products:stock-in']),
  validate(productStockInSchema),
  productController.addStockIn
);

router.post(
  "/",
  authMiddleware,
  permissionMiddleware(['products:create']),
  storage('products')('image_path'),
  validate(createProductSchema),
  productController.createProduct
);
router.put('/:id',
  authMiddleware,
  permissionMiddleware(['products:update']),
  storage('products')('image_path'),
  validate(updateProductSchema),
  productController.updateProduct
);
router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware(['products:delete']),
  validate(deleteProductSchema),
  productController.deleteProduct
);

// GET detailed product with materials relation
router.get(
  "/:id/detail",
  authMiddleware,
  permissionMiddleware(['products:read:detail']),
  productController.getDetailedProduct
);
router.post('/:id/materials', authMiddleware, permissionMiddleware(['products:materials:assign']), productController.assignMaterialsToProduct);
// router.put('/:id/materials', productController.unassignMaterialsToProduct);

export default router;