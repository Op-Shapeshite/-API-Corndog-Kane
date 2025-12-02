import express from 'express';
import { validate } from '../../validations/validate.middleware';
import { 
  createOutletRequestSchema,
  updateProductRequestSchema,
  updateMaterialRequestSchema,
  approveRequestsSchema
} from '../../validations/outletRequest.validation';
import { OutletRequestController } from '../../controllers/OutletRequestController';
import { OutletRequestService } from '../../../../core/services/OutletRequestService';
import { OutletProductRequestRepository } from '../../../../adapters/postgres/repositories/OutletProductRequestRepository';
import { OutletMaterialRequestRepository } from '../../../../adapters/postgres/repositories/OutletMaterialRequestRepository';
import { authMiddleware } from '../../../../policies/authMiddleware';
import { permissionMiddleware } from '../../../../policies/permissionMiddleware';

const router = express.Router();

// Initialize repositories
const productRequestRepo = new OutletProductRequestRepository();
const materialRequestRepo = new OutletMaterialRequestRepository();

// Initialize service
const outletRequestService = new OutletRequestService(
  productRequestRepo,
  materialRequestRepo
);

// Initialize controller
const outletRequestController = new OutletRequestController(outletRequestService);

/**
 * @route   POST /api/v1/outlet-requests
 * @desc    Create a new batch request (products and/or materials)
 * @access  OUTLET | EMPLOYEE (Mobile)
 */
router.post(
  '/',
  authMiddleware,
  permissionMiddleware(['mobile:outlet-requests:create']),
  validate(createOutletRequestSchema),
  outletRequestController.createBatchRequest
);

/**
 * @route   GET /api/v1/outlet-requests/:date/:outlet_id
 * @desc    Get detailed outlet requests by date and outlet
 * @access  WAREHOUSE | ADMIN | SUPERADMIN
 */
router.get(
  '/:date/:outlet_id',
  authMiddleware,
  permissionMiddleware(['warehouse:outlet-requests:read']),
  outletRequestController.getDetailedByDateAndOutlet
);

/**
 * @route   GET /api/v1/outlet-requests
 * @desc    Get all requests with pagination (admin)
 * @access  WAREHOUSE | ADMIN | SUPERADMIN
 */
router.get(
  '/',
  authMiddleware,
  permissionMiddleware(['warehouse:outlet-requests:read']),
  outletRequestController.getAllRequests
);

/**
 * @route   GET /api/v1/outlet-requests/my
 * @desc    Get requests for the authenticated user's outlet
 * @access  OUTLET | EMPLOYEE
 */
router.get(
  '/my',
  authMiddleware,
  permissionMiddleware(['mobile:outlet-requests:create']),
  outletRequestController.getMyRequests
);

/**
 * @route   PUT /api/v1/outlet-requests/products/:id
 * @desc    Update a product request (only productId and quantity)
 * @access  WAREHOUSE | ADMIN | SUPERADMIN
 */
router.put(
  '/products/:id',
  authMiddleware,
  permissionMiddleware(['warehouse:outlet-requests:update']),
  validate(updateProductRequestSchema),
  outletRequestController.updateProductRequest
);

/**
 * @route   PUT /api/v1/outlet-requests/materials/:id
 * @desc    Update a material request (only materialId and quantity)
 * @access  WAREHOUSE | ADMIN | SUPERADMIN
 */
router.put(
  '/materials/:id',
  authMiddleware,
  permissionMiddleware(['warehouse:outlet-requests:update']),
  validate(updateMaterialRequestSchema),
  outletRequestController.updateMaterialRequest
);

/**
 * @route   DELETE /api/v1/outlet-requests/:date
 * @desc    Delete all requests for a specific date (authenticated user's outlet only)
 * @access  OUTLET | EMPLOYEE
 */
router.delete(
  '/:date',
  authMiddleware,
  permissionMiddleware(['mobile:outlet-requests:create']),
  outletRequestController.deleteByDate
);

/**
 * @route   DELETE /api/v1/outlet-requests/products/:id
 * @desc    Delete a product request (soft delete)
 * @access  WAREHOUSE | ADMIN | SUPERADMIN
 */
router.delete(
  '/products/:id',
  authMiddleware,
  permissionMiddleware(['warehouse:outlet-requests:delete']),
  outletRequestController.deleteProductRequest
);

/**
 * @route   DELETE /api/v1/outlet-requests/materials/:id
 * @desc    Delete a material request (soft delete)
 * @access  WAREHOUSE | ADMIN | SUPERADMIN
 */
router.delete(
  '/materials/:id',
  authMiddleware,
  permissionMiddleware(['warehouse:outlet-requests:delete']),
  outletRequestController.deleteMaterialRequest
);

/**
 * @route   PATCH /api/v1/outlet-requests/approve
 * @desc    Approve multiple requests with approval quantities
 * @access  WAREHOUSE | ADMIN | SUPERADMIN
 */
router.patch(
  '/approve',
  authMiddleware,
  permissionMiddleware(['warehouse:outlet-requests:approve']),
  validate(approveRequestsSchema),
  outletRequestController.approveRequests
);

/**
 * @route   PATCH /api/v1/outlet-requests/products/:id/reject
 * @desc    Reject a product request
 * @access  WAREHOUSE | ADMIN | SUPERADMIN
 */
router.patch(
  '/products/:id/reject',
  authMiddleware,
  permissionMiddleware(['warehouse:outlet-requests:approve']),
  outletRequestController.rejectProductRequest
);

/**
 * @route   PATCH /api/v1/outlet-requests/materials/:id/reject
 * @desc    Reject a material request
 * @access  WAREHOUSE | ADMIN | SUPERADMIN
 */
router.patch(
  '/materials/:id/reject',
  authMiddleware,
  permissionMiddleware(['warehouse:outlet-requests:approve']),
  outletRequestController.rejectMaterialRequest
);

export default router;
