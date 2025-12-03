import { Request, Response } from "express";
import { TMetadataResponse } from "../../../core/entities/base/response";
import { TPayrollListResponse, TPayrollDetailResponse, TPayrollSlipResponse } from "../../../core/entities/payroll/payroll";
import { TBasePayrollResponse } from "../../../core/entities/payroll/basePayroll";
import Controller from "./Controller";
import PayrollService from "../../../core/services/PayrollService";
import { PayrollListResponseMapper, PayrollDetailResponseMapper, PayrollSlipResponseMapper } from "../../../mappers/response-mappers/PayrollResponseMapper";
import { AuthRequest } from "../../../policies/authMiddleware";
import ExcelJS from 'exceljs';
import { styleHeaderRow, setExcelHeaders, autoSizeColumns } from "../../../utils/excelHelpers";

type TPayrollResponseTypes = TPayrollListResponse[] | TPayrollDetailResponse | TPayrollSlipResponse | TBasePayrollResponse | null;

export class PayrollController extends Controller<TPayrollResponseTypes, TMetadataResponse> {
  constructor() {
    super();
  }
  getAllPayrolls = async (req: Request, res: Response, payrollService: PayrollService) => {
    try {
      const { start_date, end_date, type } = req.query;

      const result = await payrollService.getAllEmployeePayrolls(
        start_date as string | undefined,
        end_date as string | undefined
      );

      const mappedData = PayrollListResponseMapper.map(result);

      if (type === 'xlsx') {


        const employeeIds = result.map((r: any) => r.employee_id);

        // Fetch detailed payroll data for each employee (bonuses & deductions)
        const detailedPayrolls = await Promise.all(
          employeeIds.map(async (employeeId: number) => {
            try {
              return await payrollService.getEmployeePayrollDetail(
                employeeId,
                start_date as string | undefined,
                end_date as string | undefined
              );
            } catch (error) {

              return null;
            }
          })
        );

        return this.generatePayrollsExcel(res, mappedData, detailedPayrolls.filter(p => p !== null));
      }

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
  updatePayroll = async (req: Request, res: Response, payrollService: PayrollService) => {
    try {
      const employeeId = parseInt(req.params.employee_id);
      const { start_period, end_period, manual_bonus, manual_deductions } = req.body;

      // If periods not provided, use latest period by default
      let finalStartPeriod = start_period;
      let finalEndPeriod = end_period;

      if (!start_period || !end_period) {
        const latestPeriod = await payrollService.getLatestPayrollPeriodForEmployee(employeeId);
        if (!latestPeriod) {
          return this.getFailureResponse(res, {
            data: null,
            metadata: { page: 1, limit: 0, total_records: 0, total_pages: 0 }
          }, [{ field: 'period', message: 'No payroll period found for this employee. Please provide start_period and end_period.', type: 'not_found' }], "No period found", 404);
        }
        finalStartPeriod = latestPeriod.start.toISOString().split('T')[0];
        finalEndPeriod = latestPeriod.end.toISOString().split('T')[0];
      }

      const result = await payrollService.updatePayrollPeriod(
        employeeId,
        finalStartPeriod as string,
        finalEndPeriod as string,
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
  createPayment = async (req: Request, res: Response, payrollService: PayrollService) => {
    try {
      const employeeId = parseInt(req.params.employee_id);

      const result = await payrollService.createPayment(employeeId);

      const mappedData = PayrollDetailResponseMapper.map(result);

      // 🔥 AUTO-POST FINANCE TRANSACTION TO ACCOUNT 6103 (Beban Gaji)
      try {
        const { TransactionRepository } = await import('../../../adapters/postgres/repositories/TransactionRepository');
        const { PrismaClient } = await import('@prisma/client');

        const transactionRepo = new TransactionRepository();
        const prisma = new PrismaClient();

        const employee = await prisma.employee.findUnique({
          where: { id: employeeId },
          select: { name: true }
        });

        const employeeName = employee?.name || 'Unknown Employee';
        const paymentDate = new Date();

        const finalAmount = (result as any).final_amount || 0;

        if (finalAmount > 0) {
          await transactionRepo.create({
            accountId: 6103, // Account: Beban Gaji
            amount: finalAmount,
            transactionType: 'EXPENSE' as any,
            description: `Gaji ${employeeName}`,
            transactionDate: paymentDate,
            referenceNumber: `PAY-${employeeId}-${paymentDate.getTime()}`
          });

          console.log(`💰 Auto-posted transaction to account 6103: Rp ${finalAmount.toLocaleString()} for ${employeeName}`);
        }

        await prisma.$disconnect();
      } catch (financeError) {
        console.error('⚠️  Auto-post finance transaction failed:', financeError);
        // Don't fail the payment request if finance posting fails
      }

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
  createInternalPayrollTemplate = async (req: Request, res: Response, payrollService: PayrollService) => {
    try {
      const { employee_id, salary } = req.body;

      if (!employee_id || !salary) {
        return this.getFailureResponse(res, {
          data: null,
          metadata: { page: 1, limit: 0, total_records: 0, total_pages: 0 }
        }, [
          { field: 'employee_id', message: 'employee_id is required', type: 'required' },
          { field: 'salary', message: 'salary is required', type: 'required' }
        ], "Validation failed", 400);
      }

      const result = await payrollService.createInternalPayrollTemplate(employee_id, salary);

      return this.getSuccessResponse(res, {
        data: result,
        metadata: {
          page: 1,
          limit: 1,
          total_records: 1,
          total_pages: 1,
        }
      }, "Payroll template created successfully");
    } catch (error) {
      return this.handleError(res, error, "Failed to create payroll template", 500, null, { page: 1, limit: 0, total_records: 0, total_pages: 0 });
    }
  };

  /**
   * Generate Excel file for payrolls with 3 sheets:
   * 1. Payroll Summary
   * 2. Bonuses
   * 3. Deductions
   */
  private async generatePayrollsExcel(
    res: Response,
    payrolls: TPayrollListResponse[],
    detailedPayrolls: any[] = []
  ) {
    try {
      const workbook = new ExcelJS.Workbook();

      // ===== SHEET 1: Payroll Summary =====
      const summarySheet = workbook.addWorksheet('Payroll Summary');

      const summaryHeaderRow = summarySheet.addRow([
        'Employee ID',
        'Employee Name',
        'Period',
        'Base Salary',
        'Total Bonus',
        'Total Deduction',
        'Final Amount',
        'Status'
      ]);
      styleHeaderRow(summaryHeaderRow);

      payrolls.forEach(payroll => {
        summarySheet.addRow([
          payroll.employee_id || '-',
          payroll.employee_name || '-',
          payroll.period || '-',
          payroll.total_base_salary || 0,
          payroll.total_bonus || 0,
          payroll.total_deduction || 0,
          payroll.final_amount || 0,
          payroll.status || '-'
        ]);
      });

      // Auto-size columns
      autoSizeColumns(summarySheet);

      // ===== SHEET 2: Bonuses =====
      const bonusSheet = workbook.addWorksheet('Bonuses');

      const bonusHeaderRow = bonusSheet.addRow([
        'Employee ID',
        'Employee Name',
        'Bonus Type',
        'Date',
        'Amount',
        'Description'
      ]);
      styleHeaderRow(bonusHeaderRow);

      detailedPayrolls.forEach((detail: any) => {
        if (detail && detail.bonuses && detail.bonuses.length > 0) {
          detail.bonuses.forEach((bonus: any) => {
            bonusSheet.addRow([
              detail.employee_id || '-',
              detail.employee_name || '-',
              bonus.type || '-',
              bonus.date ? new Date(bonus.date).toLocaleDateString('id-ID') : '-',
              bonus.amount || 0,
              bonus.description || '-'
            ]);
          });
        }
      });

      if (bonusSheet.rowCount === 1) {
        bonusSheet.addRow(['No bonuses recorded for this period', '', '', '', '', '']);
      }

      autoSizeColumns(bonusSheet);

      // ===== SHEET 3: Deductions =====
      const deductionSheet = workbook.addWorksheet('Deductions');

      const deductionHeaderRow = deductionSheet.addRow([
        'Employee ID',
        'Employee Name',
        'Deduction Type',
        'Date',
        'Amount',
        'Description'
      ]);
      styleHeaderRow(deductionHeaderRow);

      detailedPayrolls.forEach((detail: any) => {
        if (detail && detail.deductions && detail.deductions.length > 0) {
          detail.deductions.forEach((deduction: any) => {
            deductionSheet.addRow([
              detail.employee_id || '-',
              detail.employee_name || '-',
              deduction.type || '-',
              deduction.date ? new Date(deduction.date).toLocaleDateString('id-ID') : '-',
              deduction.amount || 0,
              deduction.description || '-'
            ]);
          });
        }
      });

      if (deductionSheet.rowCount === 1) {
        deductionSheet.addRow(['No deductions recorded for this period', '', '', '', '', '']);
      }

      autoSizeColumns(deductionSheet);

      const filename = `payroll-${new Date().toISOString().split('T')[0]}.xlsx`;
      setExcelHeaders(res, filename);

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Error generating Excel:', error);
      throw error;
    }
  }
}
