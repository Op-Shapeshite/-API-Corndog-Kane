import express from 'express';
import { validate } from '../../validations/validate.middleware';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  getEmployeeByIdSchema,
  deleteEmployeeSchema,
  getEmployeesSchema,
  getAttendancesByOutletSchema,
  getSchedulesSchema,
  updateLateApprovalStatusSchema,
} from '../../validations/employee.validation';
import { deleteScheduleSchema } from '../../validations/schedule-delete.validation';
import { EmployeeController } from '../../controllers/EmployeeController';
import EmployeeService from '../../../../core/services/EmployeeService';
import EmployeeRepository from '../../../../adapters/postgres/repositories/EmployeeRepository';
import PayrollService from '../../../../core/services/PayrollService';
import PayrollRepository from '../../../../adapters/postgres/repositories/PayrollRepository';
import OutletRepository from '../../../../adapters/postgres/repositories/OutletRepository';
import { EmployeeResponseMapper } from '../../../../mappers/response-mappers/EmployeeResponseMapper';
import { authMiddleware } from '../../../../policies/authMiddleware';
import { permissionMiddleware } from '../../../../policies';
import { storage, storageMultiple } from '../../../../policies/uploadImages';
import { OutletController } from '../../controllers/OutletController';

const router = express.Router();

const employeeController = new EmployeeController();
const outletController = new OutletController();
const payrollRepository = new PayrollRepository();
const outletRepository = new OutletRepository();
const payrollService = new PayrollService(payrollRepository, outletRepository);
const employeeService = new EmployeeService(new EmployeeRepository(), payrollService);

// Upload middleware for attendance images
const uploadAttendanceImage = storage('absent');
const uploadMultipleAttendanceImages = storageMultiple('absent');

// Upload middleware for employee image
const uploadEmployeeImage = storage('employee');

router.get('/', authMiddleware, permissionMiddleware(['hr:employees:read']), validate(getEmployeesSchema), employeeController.findAll(employeeService, EmployeeResponseMapper));
// IMPORTANT: /schedule must come BEFORE /:id to avoid route conflicts
router.get('/schedule', authMiddleware, permissionMiddleware(['hr:schedules:read']), validate(getSchedulesSchema), (req, res) => employeeController.getSchedules(req, res, employeeService));

router.get('/schedule/:outletId',
  authMiddleware,
  permissionMiddleware(['hr:schedules:read:by-outlet']),
  validate(getAttendancesByOutletSchema),
  (req, res) => employeeController.getAttendancesByOutlet(req, res, employeeService)
);

// Attendance endpoints
router.post('/checkin',
  authMiddleware,
  permissionMiddleware(['hr:attendance:create']),
  uploadMultipleAttendanceImages([
    { name: 'image_proof', maxCount: 1 },
    { name: 'late_present_proof', maxCount: 1 }
  ]),
  (req, res) => employeeController.checkin(req, res, employeeService)
);
router.post('/checkout',
  authMiddleware,
  permissionMiddleware(['hr:attendance:create']),
  uploadAttendanceImage('image_proof'),
  (req, res) => employeeController.checkout(req, res, employeeService)
);

router.patch('/:id/:status',
  authMiddleware,
  permissionMiddleware(['hr:employees:late-approval:update']),
  validate(updateLateApprovalStatusSchema),
  (req, res) => employeeController.updateLateApprovalStatus(req, res, employeeService)
);

router.get('/:id', authMiddleware, permissionMiddleware(['hr:employees:read:detail']), validate(getEmployeeByIdSchema), (req, res) => employeeController.findById(req, res, employeeService));
router.post('/',
  authMiddleware,
  permissionMiddleware(['hr:employees:create']),
  uploadEmployeeImage('image'),
  validate(createEmployeeSchema),
  (req, res) => employeeController.createEmployee(req, res, employeeService)
);
router.put('/:id',
  authMiddleware,
  permissionMiddleware(['hr:employees:update']),
  uploadEmployeeImage('image_path'),
  validate(updateEmployeeSchema),
  (req, res) => employeeController.updateEmployee(req, res, employeeService)
);
router.delete('/:id', authMiddleware, permissionMiddleware(['hr:employees:delete']), validate(deleteEmployeeSchema), employeeController.delete(employeeService, 'Employee deleted successfully'));

// Delete schedule by outlet_id and date
router.delete(
  "/schedule/:outlet_id/:date",
  authMiddleware,
  permissionMiddleware(['hr:schedules:delete']),
  validate(deleteScheduleSchema),
  outletController.deleteSchedule
);

export default router;
