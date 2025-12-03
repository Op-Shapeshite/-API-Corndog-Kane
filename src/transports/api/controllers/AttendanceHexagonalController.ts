import { Request, Response } from 'express';
import { AttendanceApplicationService } from '../../../core/application/AttendanceApplicationService';
import { CheckinCommand, CheckoutCommand, ApproveLateArrivalCommand, RejectLateArrivalCommand } from '../../../core/application/commands/AttendanceCommands';
import { GetTodayAttendanceQuery, GetAttendanceDetailsQuery, GetOutletAttendancesQuery } from '../../../core/application/queries/AttendanceQueries';
import { EmployeeId } from '../../../core/domain/value-objects/EmployeeId';
import { OutletId } from '../../../core/domain/value-objects/OutletId';
import { DateTime } from '../../../core/domain/value-objects/DateTime';
import { AttendanceId } from '../../../core/domain/value-objects/AttendanceId';
import { DomainError } from '../../../core/domain/exceptions/AttendanceExceptions';

/**
 * Hexagonal Architecture Controller
 * Slim controller that orchestrates between HTTP transport and Application Services
 * No business logic - only request/response handling
 */
export class AttendanceController {
  constructor(private attendanceService: AttendanceApplicationService) {}

  /**
   * POST /attendance/checkin
   * Employee check-in endpoint
   */
  async checkin(req: Request, res: Response): Promise<void> {
    try {
      // 1. Extract and validate input
      const { employee_id, outlet_id, image_proof, late_notes, late_present_proof } = req.body;

      if (!employee_id || !outlet_id || !image_proof) {
        res.status(400).json({
          status: 'error',
          message: 'Missing required fields: employee_id, outlet_id, image_proof'
        });
        return;
      }

      // 2. Map to command
      const command = new CheckinCommand(
        EmployeeId.fromNumber(employee_id),
        OutletId.fromNumber(outlet_id),
        DateTime.now(),
        image_proof,
        late_notes,
        late_present_proof
      );

      // 3. Execute business logic
      const result = await this.attendanceService.checkin.handle(command);

      // 4. Return response
      res.status(201).json({
        status: 'success',
        message: 'Check-in recorded successfully',
        data: result
      });

    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * POST /attendance/checkout
   * Employee check-out endpoint
   */
  async checkout(req: Request, res: Response): Promise<void> {
    try {
      // 1. Extract and validate input
      const { employee_id, image_proof } = req.body;

      if (!employee_id || !image_proof) {
        res.status(400).json({
          status: 'error',
          message: 'Missing required fields: employee_id, image_proof'
        });
        return;
      }

      // 2. Map to command
      const command = new CheckoutCommand(
        EmployeeId.fromNumber(employee_id),
        DateTime.now(),
        image_proof
      );

      // 3. Execute business logic
      const result = await this.attendanceService.checkout.handle(command);

      // 4. Return response
      res.status(200).json({
        status: 'success',
        message: 'Check-out recorded successfully',
        data: result
      });

    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /attendance/today/:employee_id
   * Get today's attendance for employee
   */
  async getTodayAttendance(req: Request, res: Response): Promise<void> {
    try {
      // 1. Extract and validate input
      const { employee_id } = req.params;

      if (!employee_id) {
        res.status(400).json({
          status: 'error',
          message: 'Missing employee_id parameter'
        });
        return;
      }

      // 2. Map to query
      const query = new GetTodayAttendanceQuery(
        EmployeeId.fromNumber(parseInt(employee_id)),
        DateTime.now()
      );

      // 3. Execute query
      const result = await this.attendanceService.getTodayAttendance.handle(query);

      // 4. Return response
      if (!result) {
        res.status(404).json({
          status: 'error',
          message: 'No attendance record found for today'
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: result
      });

    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /attendance/:id
   * Get attendance details by ID
   */
  async getAttendanceDetails(req: Request, res: Response): Promise<void> {
    try {
      // 1. Extract and validate input
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          status: 'error',
          message: 'Missing attendance ID parameter'
        });
        return;
      }

      // 2. Map to query
      const query = new GetAttendanceDetailsQuery(
        AttendanceId.fromNumber(parseInt(id))
      );

      // 3. Execute query
      const result = await this.attendanceService.getAttendanceDetails.handle(query);

      // 4. Return response
      res.status(200).json({
        status: 'success',
        data: result
      });

    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /outlet/:outlet_id/attendances
   * Get attendances for outlet with pagination
   */
  async getOutletAttendances(req: Request, res: Response): Promise<void> {
    try {
      // 1. Extract and validate input
      const { outlet_id } = req.params;
      const { start_date, end_date, page = '1', limit = '10' } = req.query;

      if (!outlet_id) {
        res.status(400).json({
          status: 'error',
          message: 'Missing outlet_id parameter'
        });
        return;
      }

      // 2. Map to query
      const query = new GetOutletAttendancesQuery(
        OutletId.fromNumber(parseInt(outlet_id)),
        start_date ? DateTime.fromString(start_date as string) : DateTime.now().startOfDay(),
        end_date ? DateTime.fromString(end_date as string) : DateTime.now().endOfDay(),
        parseInt(page as string),
        parseInt(limit as string)
      );

      // 3. Execute query
      const result = await this.attendanceService.getOutletAttendances.handle(query);

      // 4. Return response
      res.status(200).json({
        status: 'success',
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages
        }
      });

    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * PATCH /attendance/:id/approve-late
   * Approve late arrival
   */
  async approveLateArrival(req: Request, res: Response): Promise<void> {
    try {
      // 1. Extract and validate input
      const { id } = req.params;
      const { approver_id } = req.body;

      if (!id || !approver_id) {
        res.status(400).json({
          status: 'error',
          message: 'Missing required fields: id, approver_id'
        });
        return;
      }

      // 2. Map to command
      const command = new ApproveLateArrivalCommand(
        parseInt(id),
        EmployeeId.fromNumber(approver_id)
      );

      // 3. Execute business logic
      const result = await this.attendanceService.approveLate.handle(command);

      // 4. Return response
      res.status(200).json({
        status: 'success',
        message: 'Late arrival approved successfully',
        data: result
      });

    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * PATCH /attendance/:id/reject-late
   * Reject late arrival
   */
  async rejectLateArrival(req: Request, res: Response): Promise<void> {
    try {
      // 1. Extract and validate input
      const { id } = req.params;
      const { approver_id } = req.body;

      if (!id || !approver_id) {
        res.status(400).json({
          status: 'error',
          message: 'Missing required fields: id, approver_id'
        });
        return;
      }

      // 2. Map to command
      const command = new RejectLateArrivalCommand(
        parseInt(id),
        EmployeeId.fromNumber(approver_id)
      );

      // 3. Execute business logic
      const result = await this.attendanceService.rejectLate.handle(command);

      // 4. Return response
      res.status(200).json({
        status: 'success',
        message: 'Late arrival rejected successfully',
        data: result
      });

    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Centralized error handling
   */
  private handleError(error: unknown, res: Response): void {
    console.error('Attendance Controller Error:', error);

    if (error instanceof DomainError) {
      res.status(400).json({
        status: 'error',
        code: error.code,
        message: error.message,
        details: error.details
      });
      return;
    }

    if (error instanceof Error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
}