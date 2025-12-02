
import express from 'express';
import { validate } from '../../validations/validate.middleware';
import { 
  createProductCategorySchema,
  updateProductCategorySchema,
  deleteProductCategorySchema
 } from '../../validations/product.category.validation';
import { getPaginationSchema } from '../../validations/pagination.validation';
import { ProductCategoryController } from '../../controllers/ProductCategory';
import ProductCategoryService from '../../../../core/services/ProductCategory';
import ProductCategoryRepository from '../../../../adapters/postgres/repositories/ProductCategory';
import { ProductCategoryResponseMapper } from '../../../../mappers/response-mappers/ProductCategoryResponseMapper';
import { authMiddleware } from '../../../../policies/authMiddleware';
import { permissionMiddleware } from '../../../../policies/permissionMiddleware';

const router = express.Router();

const productCategoryController = new ProductCategoryController();
const productCategoryService = new ProductCategoryService(new ProductCategoryRepository());

/**
 * @route GET /api/v1/categories
 * @access ALL AUTHENTICATED USERS
 */
router.get(
	"/",
	authMiddleware,
	permissionMiddleware(['common:categories:read']),
	validate(getPaginationSchema),
	productCategoryController.findAll(
		productCategoryService,
		ProductCategoryResponseMapper
	)
);

/**
 * @route POST /api/v1/categories
 * @access ADMIN | SUPERADMIN
 */
router.post(
	"/",
	authMiddleware,
	permissionMiddleware(['products:create']),
	validate(createProductCategorySchema),
	productCategoryController.create(
		productCategoryService,
		ProductCategoryResponseMapper,
		"Kategori produk berhasil dibuat"
	)
);

/**
 * @route PUT /api/v1/categories/:id
 * @access ADMIN | SUPERADMIN
 */
router.put('/:id',
  authMiddleware,
  permissionMiddleware(['products:update']),
  validate(updateProductCategorySchema),
  productCategoryController.update(
    productCategoryService,
    ProductCategoryResponseMapper,
    'Kategori produk berhasil diperbarui'
  )
);

/**
 * @route DELETE /api/v1/categories/:id
 * @access ADMIN | SUPERADMIN
 */
router.delete(
	"/:id",
	authMiddleware,
	permissionMiddleware(['products:delete']),
	validate(deleteProductCategorySchema),
	productCategoryController.delete(
		productCategoryService,
		"Kategori produk berhasil dihapus"
	)
);

export default router;