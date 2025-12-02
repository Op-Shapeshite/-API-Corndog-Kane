import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { TErrorResponse, TResponse } from '../core/entities/base/response';
import EmployeeRepository from '../adapters/postgres/repositories/EmployeeRepository';

const sendFailureResponse = (
  res: Response, 
  errors: TErrorResponse[], 
  message: string, 
  code: number
): Response => {
  return res.status(code).json({
    status: "failed",
    message,
    data: null,
    errors,
    metadata: null,
  } as TResponse<null, null>);
};

/**
 * Check-in verification middleware - Validates if authenticated outlet employee has checked in today
 * Must be used after authMiddleware
 * Only applies to Karyawan (Employee/Outlet) role
 * 
 * @example
 * router.post('/orders', authMiddleware, checkinMiddleware, controller.createOrder);
 */
export const checkinMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;

    if (!user) {
      return sendFailureResponse(
        res,
        [{ field: 'authentication', message: 'Anda belum login ke sistem', type: 'required' }],
        'Anda belum login ke sistem',
        401
      );
    }

    // Only check for Karyawan (Employee/Outlet) role
    if (user.role === 'Karyawan') {
      const employeeRepository = new EmployeeRepository();
      
      // Find the scheduled employee for this user
      const scheduledEmployeeId = await employeeRepository.findScheduledEmployeeByUserId(+user.id);
      
      if (!scheduledEmployeeId) {
        return sendFailureResponse(
          res,
          [{ field: 'schedule', message: 'Tidak ada karyawan yang dijadwalkan untuk outlet ini hari ini', type: 'not_found' }],
          'Tidak ada jadwal kerja untuk hari ini',
          403
        );
      }

      // Check if the employee has checked in today
      const todayAttendance = await employeeRepository.findTodayAttendance(scheduledEmployeeId);
      
      if (!todayAttendance || !todayAttendance.checkinTime) {
        return sendFailureResponse(
          res,
          [{ field: 'checkin', message: 'Anda harus absen masuk terlebih dahulu sebelum membuat pesanan', type: 'required' }],
          'Silakan absen masuk terlebih dahulu',
          403
        );
      }
    }

    // Allow access for other roles or if check-in validation passed
    next();
  } catch (error) {
    console.error('Check-in middleware error:', error);
    return sendFailureResponse(
      res,
      [{ field: 'middleware', message: 'Terjadi kesalahan sistem saat memvalidasi absensi', type: 'internal_error' }],
      'Terjadi kesalahan sistem',
      500
    );
  }
};