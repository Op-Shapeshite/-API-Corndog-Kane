
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
import { permissionMiddleware } from '../../../../policies';

const router = express.Router();

const productCategoryController = new ProductCategoryController();
const productCategoryService = new ProductCategoryService(new ProductCategoryRepository());

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
router.post(
	"/",
	authMiddleware,
	permissionMiddleware(['common:categories:create']),
	validate(createProductCategorySchema),
	productCategoryController.create(
		productCategoryService,
		ProductCategoryResponseMapper,
		"Product Category created successfully"
	)
);
router.put('/:id',
  authMiddleware,
  permissionMiddleware(['common:categories:update']),
  validate(updateProductCategorySchema),
  productCategoryController.update(
    productCategoryService,
    ProductCategoryResponseMapper,
    'Product Category updated successfully'
  ));
router.delete(
	"/:id",
	authMiddleware,
	permissionMiddleware(['common:categories:delete']),
	validate(deleteProductCategorySchema),
	productCategoryController.delete(
		productCategoryService,
		"Product Category deleted successfully"
	)
);

export default router;