import { Request, Response } from "express";
import { TMetadataResponse } from "../../../core/entities/base/response";
import { TPayrollListResponse, TPayrollDetailResponse, TPayrollSlipResponse } from "../../../core/entities/payroll/payroll";
import Controller from "./Controller";
import PayrollService from "../../../core/services/PayrollService";
import { PayrollListResponseMapper, PayrollDetailResponseMapper, PayrollSlipResponseMapper } from "../../../mappers/response-mappers/PayrollResponseMapper";
import { AuthRequest } from "../../../policies/authMiddleware";

type TPayrollResponseTypes = TPayrollListResponse[] | TPayrollDetailResponse | TPayrollSlipResponse | null;

export class PayrollController extends Controller<TPayrollResponseTypes, TMetadataResponse> {
  constructor() {
    super();
  }

  /**
   * GET /finance/payroll
   * Get all employee payroll summary
   */
  getAllPayrolls = async (req: Request, res: Response, payrollService: PayrollService) => {
    try {
      const { start_date, end_date } = req.query;

      const result = await payrollService.getAllEmployeePayrolls(
        start_date as string | undefined,
        end_date as string | undefined
      );

      const mappedData = PayrollListResponseMapper.map(result);

      return this.getSuccessResponse(res, {
        data: mappedData,
        metadata: {
          page: 1,
          limit: result.length,
          total_records: 1,
          total_pages: 1,
        }
      }, "Payroll list retrieved successfully");
    } catch (error) {
      return this.handleError(
        res,
        error,
        "Failed to retrieve payrolls",
        500,
        [],
        { page: 1, limit: 0, total_records: 0, total_pages: 0 }
      );
    }
  };

  /**
   * GET /finance/payroll/:employee_id
   * Get payroll detail for employee (for editing)
   */
  getPayrollDetail = async (req: Request, res: Response, payrollService: PayrollService) => {
    try {
      const employeeId = parseInt(req.params.employee_id);
      const { start_date, end_date } = req.query;

      const result = await payrollService.getEmployeePayrollDetail(
        employeeId,
        start_date as string | undefined,
        end_date as string | undefined
      );

      const mappedData = PayrollDetailResponseMapper.map(result);

      return this.getSuccessResponse(res, {
        data: mappedData,
        metadata: {
          page: 1,
          limit: 1,
          total_records: 1,
          total_pages: 1,
        }
      }, "Payroll detail retrieved successfully");
    } catch (error) {
      return this.handleError(res, error, "Operation failed", 500, null, { page: 1, limit: 0, total_records: 0, total_pages: 0 });
    }
  };

  /**
   * PUT /finance/payroll/:employee_id
   * Update payroll with manual bonus/deduction
   */
  updatePayroll = async (req: Request, res: Response, payrollService: PayrollService) => {
    try {
      const employeeId = parseInt(req.params.employee_id);
      const { start_period, end_period, manual_bonus, manual_deductions } = req.body;

      if (!start_period || !end_period) {
        return this.getFailureResponse(res, {
          data: null,
          metadata: { page: 1, limit: 0, total_records: 0, total_pages: 0 }
        }, [{ field: 'period', message: 'start_period and end_period are required', type: 'required' }], "Validation failed", 400);
      }

      const result = await payrollService.updatePayrollPeriod(
        employeeId,
        start_period as string,
        end_period as string,
        manual_bonus,
        manual_deductions || []
      );

      const mappedData = PayrollDetailResponseMapper.map(result);

      return this.getSuccessResponse(res, {
        data: mappedData,
        metadata: {
          page: 1,
          limit: 1,
          total_records: 1,
          total_pages: 1,
        }
      }, "Payroll updated successfully");
    } catch (error) {
      return this.handleError(res, error, "Operation failed", 500, null, { page: 1, limit: 0, total_records: 0, total_pages: 0 });
    }
  };

  /**
   * POST /finance/payroll/:employee_id
   * Create payment for employee
   */
  createPayment = async (req: Request, res: Response, payrollService: PayrollService) => {
    try {
      const employeeId = parseInt(req.params.employee_id);

      const result = await payrollService.createPayment(employeeId);

      const mappedData = PayrollDetailResponseMapper.map(result);

      return this.getSuccessResponse(res, {
        data: mappedData,
        metadata: {
          page: 1,
          limit: 1,
          total_records: 1,
          total_pages: 1,
        }
      }, "Payment created successfully");
    } catch (error) {
      return this.handleError(res, error, "Operation failed", 500, null, { page: 1, limit: 0, total_records: 0, total_pages: 0 });
    }
  };

  /**
   * GET /finance/payroll/pay/:employee_id
   * Get payment slip
   */
  getPaymentSlip = async (req: Request, res: Response, payrollService: PayrollService) => {
    try {
      const employeeId = parseInt(req.params.employee_id);
      const { start_date, end_date } = req.query;

      const result = await payrollService.getPaymentSlip(
        employeeId,
        start_date as string | undefined,
        end_date as string | undefined
      );

      const mappedData = PayrollSlipResponseMapper.map(result);

      return this.getSuccessResponse(res, {
        data: mappedData,
        metadata: {
          page: 1,
          limit: 1,
          total_records: 1,
          total_pages: 1,
        }
      }, "Payment slip retrieved successfully");
    } catch (error) {
      return this.handleError(res, error, "Operation failed", 500, null, { page: 1, limit: 0, total_records: 0, total_pages: 0 });
    }
  };
}
