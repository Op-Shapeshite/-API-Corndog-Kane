import { Request, Response } from "express";
import { TMetadataResponse } from "../../../core/entities/base/response";
import { TEmployeeGetResponse, TEmployee } from "../../../core/entities/employee/employee";
import { TAttendanceGetResponse, TAttendanceListResponse, TAttendanceTableResponse } from "../../../core/entities/employee/attendance";
import { TOutletAssignmentGetResponse, TOutletAssignmentWithRelations } from "../../../core/entities/outlet/assignment";
import Controller from "./Controller";
import EmployeeService from "../../../core/services/EmployeeService";
import { EmployeeResponseMapper } from "../../../mappers/response-mappers/EmployeeResponseMapper";
import { AttendanceResponseMapper } from "../../../mappers/response-mappers/AttendanceResponseMapper";
import { AttendanceListResponseMapper } from "../../../mappers/response-mappers/AttendanceListResponseMapper";
import { AttendanceTableResponseMapper } from "../../../mappers/response-mappers/AttendanceTableResponseMapper";
import { OutletAssignmentResponseMapper } from "../../../mappers/response-mappers/OutletAssignmentResponseMapper";
import { AuthRequest } from "../../../policies/authMiddleware";
import OutletRepository from "../../../adapters/postgres/repositories/OutletRepository";
import EmployeeRepository from "../../../adapters/postgres/repositories/EmployeeRepository";
import fs from "fs";
import path from "path";
import ExcelJS from 'exceljs';
import { styleHeaderRow, setExcelHeaders, autoSizeColumns, formatDate } from "../../../utils/excelHelpers";

// Union type for all possible employee response types
type TEmployeeResponseTypes = TEmployeeGetResponse | TOutletAssignmentGetResponse | TAttendanceGetResponse | TAttendanceListResponse[] | TAttendanceTableResponse[] | null;

export class EmployeeController extends Controller<TEmployeeResponseTypes, TMetadataResponse> {
  constructor() {
    super();
  }

  /**
   * Convert snake_case to camelCase for employee data
   */
  private snakeToCamel<TObj extends Record<string, unknown>>(obj: TObj): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        result[camelKey] = this.snakeToCamel(value as Record<string, unknown>);
      } else if (Array.isArray(value)) {
        result[camelKey] = value.map(item =>
          item && typeof item === 'object' && !(item instanceof Date)
            ? this.snakeToCamel(item as Record<string, unknown>)
            : item
        );
      } else {
        result[camelKey] = value;
      }
    }

    return result;
  }

  findById = async (req: Request, res: Response, employeeService: EmployeeService) => {
    const { id } = req.params;
    try {
      const employee = await employeeService.findById(id);

      if (!employee) {
        return this.getFailureResponse(
          res,
          { data: null, metadata: {} as TMetadataResponse },
          null,
          'Karyawan tidak ditemukan',
          404
        );
      }

      const responseData: TEmployeeGetResponse = EmployeeResponseMapper.toResponse(employee);

      return this.getSuccessResponse(
        res,
        {
          data: responseData,
          metadata: {} as TMetadataResponse
        },
        'Berhasil mengambil data karyawan'
      );
    } catch (error) {
      return this.handleError(
        res,
        error,
        'Gagal mengambil data karyawan',
        500,
        [],
        {} as TMetadataResponse
      );
    }
  };

  /**
   * Create employee with image upload
   * POST /employees
   */
  createEmployee = async (req: Request, res: Response, employeeService: EmployeeService) => {
    try {
      const imagePath = req.file?.filename;

      if (!imagePath) {
        return this.getFailureResponse(
          res,
          { data: null, metadata: {} as TMetadataResponse },
          [{ field: 'image_path', message: 'Foto karyawan wajib diupload', type: 'required' }],
          'Error validasi',
          400
        );
      }

      console.log('=== DEBUG: req.body after validation ===');
      console.log('province_id type:', typeof req.body.province_id, 'value:', req.body.province_id);
      console.log('city_id type:', typeof req.body.city_id, 'value:', req.body.city_id);

      // Convert snake_case to camelCase while preserving types (integers, dates, etc.)
      const requestData = this.snakeToCamel({
        ...req.body,
        province_id: Number(req.body.province_id),
        city_id: Number(req.body.city_id),
        district_id: Number(req.body.district_id),
        subdistrict_id: Number(req.body.subdistrict_id),
        image_path: imagePath,
      });

      console.log('=== DEBUG: after snakeToCamel ===');
      console.log('provinceId type:', typeof requestData.provinceId, 'value:', requestData.provinceId);
      console.log('cityId type:', typeof requestData.cityId, 'value:', requestData.cityId);

      const newEmployee = await employeeService.create(requestData as TEmployee);

      return this.getSuccessResponse(
        res,
        {
          data: EmployeeResponseMapper.toResponse(newEmployee),
          metadata: {} as TMetadataResponse,
        },
        'Berhasil membuat data karyawan baru'
      );
    } catch (error) {
      // Delete uploaded image if creation fails
      if (req.file?.filename) {
        const imagePath = path.join(process.cwd(), 'public', 'employee', req.file.filename);
        fs.unlink(imagePath, (err) => {
          if (err) console.error("Error deleting image:", err);
        });
      }

      return this.handleError(
        res,
        error,
        'Gagal membuat data karyawan baru',
        500,
        {} as TEmployeeGetResponse,
        {} as TMetadataResponse
      );
    }
  };

  /**
   * Update employee with optional image upload
   * PUT /employees/:id
   */
  updateEmployee = async (req: Request, res: Response, employeeService: EmployeeService) => {
    const employeeId = req.params.id;

    try {
      const imagePath = req.file?.filename;
      if (imagePath) {
        const existingEmployee = await employeeService.findById(employeeId);
        if (existingEmployee && existingEmployee.imagePath) {
          const oldImagePath = path.join(process.cwd(), 'public', 'employee', existingEmployee.imagePath);
          fs.unlink(oldImagePath, (err) => {
            if (err) console.error("Error deleting old image:", err);
          });
        }
      }

      // Convert snake_case to camelCase while preserving types (integers, dates, etc.)
      const requestData = this.snakeToCamel({
        ...req.body,
        ...(imagePath && { image_path: imagePath }),
      });

      const updatedEmployee = await employeeService.update(employeeId, requestData);

      return this.getSuccessResponse(
        res,
        {
          data: EmployeeResponseMapper.toResponse(updatedEmployee),
          metadata: {} as TMetadataResponse,
        },
        'Employee updated successfully'
      );
    } catch (error) {
      // Delete uploaded image if update fails
      if (req.file?.filename) {
        const imagePath = path.join(process.cwd(), 'public', 'employee', req.file.filename);
        fs.unlink(imagePath, (err) => {
          if (err) console.error("Error deleting image:", err);
        });
      }

      return this.handleError(
        res,
        error,
        'Failed to update employee',
        500,
        {} as TEmployeeGetResponse,
        {} as TMetadataResponse
      );
    }
  };

  getSchedules = async (req: Request, res: Response, employeeService: EmployeeService) => {
    try {
      const view = req.query.view as string | undefined;
      const type = req.query.type as string;
      const startDate = req.query.start_date as string | undefined;
      const endDate = req.query.end_date as string | undefined;
      const status = req.query.status as string | undefined;
      const searchKey = req.query.search_key as string | undefined;
      const searchValue = req.query.search_value as string | undefined;
      const page = req.query.page ? parseInt(req.query.page as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      if (type === 'xlsx') {
        // Fetch timeline view (schedule assignments)
        const schedulesResult = await employeeService.getSchedules(undefined, startDate, endDate, status, searchKey, searchValue, page, limit);
        const schedules = (schedulesResult as Array<{
          id: number;
          outlet_id: number;
          employee_id: number;
          assigned_at: Date;
          is_active: boolean;
          createdAt: Date;
          updatedAt: Date;
          outlet: { id: number; name: string; location: string; check_in_time: string; check_out_time: string };
          employee: { id: number; name: string; phone: string; nik: string; address: string };
        }>).map(schedule => OutletAssignmentResponseMapper.toResponse(schedule));

        // Fetch table view (attendance data)
        const attendanceResult = await employeeService.getSchedules('table', startDate, endDate, status, searchKey, searchValue, page, limit) as {
          data: Array<any>;
          pagination: any;
        };
        const attendance = AttendanceTableResponseMapper.toListResponse(attendanceResult.data);

        return this.generateScheduleExcel(res, schedules, attendance);
      }
      const result = await employeeService.getSchedules(view, startDate, endDate, status, searchKey, searchValue, page, limit);
      if (view === 'table') {
        const resultWithPagination = result as {
          data: Array<{
            id: number;
            employee: { name: string; image_path: string };
            outlet: { name: string };
            checkin_time: Date;
            checkin_image_proof: string;
            checkout_time: Date | null;
            checkout_image_proof: string | null;
            attendance_status: string;
            late_minutes: number;
            late_present_proof: string | null;
            late_notes: string | null;
            late_approval_status: string;
          }>;
          pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
          };
        };

        const tableResponse: TAttendanceTableResponse[] = AttendanceTableResponseMapper.toListResponse(
          resultWithPagination.data
        );

        return this.getSuccessResponse(
          res,
          {
            data: tableResponse,
            metadata: {
              page: resultWithPagination.pagination.page,
              limit: resultWithPagination.pagination.limit,
              total_records: resultWithPagination.pagination.total,
              total_pages: resultWithPagination.pagination.totalPages,
            } as TMetadataResponse,
          },
          'Employee attendance table retrieved successfully'
        );
      }
      const schedulesResponse: TOutletAssignmentGetResponse[] = (result as Array<{
        id: number;
        outlet_id: number;
        employee_id: number;
        assigned_at: Date;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
        outlet: { id: number; name: string; location: string; check_in_time: string; check_out_time: string };
        employee: { id: number; name: string; phone: string; nik: string; address: string };
      }>).map(schedule =>
        OutletAssignmentResponseMapper.toResponse(schedule)
      );

      return this.getSuccessResponse(
        res,
        {
          data: schedulesResponse,
          metadata: {} as TMetadataResponse,
        },
        'Employee schedules retrieved successfully'
      );
    } catch (error) {
      return this.handleError(
        res,
        error,
        'Failed to retrieve employee schedules',
        500,
        [],
        {} as TMetadataResponse
      );
    }
  };

  /**
   * Employee check-in
   * POST /employee/checkin
   * Validation is handled by Zod schema
   */
  checkin = async (req: AuthRequest, res: Response, employeeService: EmployeeService) => {
    try {
      const userId = req.user?.id;
      const outletId = req.user?.outlet_id;

      if (!userId || !outletId) {
        return this.getFailureResponse(
          res,
          { data: null, metadata: {} as TMetadataResponse },
          [{ field: 'authentication', message: 'User or outlet information not found', type: 'invalid' }],
          'Authentication error',
          401
        );
      }
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const imagePath = files?.image_proof?.[0]?.filename;
      const latePresentProof = files?.late_present_proof?.[0]?.filename;
      const lateNotes = req.body.late_notes;

      if (!imagePath) {
        return this.getFailureResponse(res,
          { data: null, metadata: {} as TMetadataResponse },
          [{ field: "image_proof", message: "Bukti foto check-in wajib diupload", type: "required" }],
          'Bukti foto check-in diperlukan',
          400
        )
      }
      const employeeId = await employeeService.findScheduledEmployeeByUserId(parseInt(userId));

      if (!employeeId) {
        return this.getFailureResponse(
          res,
          { data: null, metadata: {} as TMetadataResponse },
          [{ field: 'employee', message: 'Tidak ada karyawan yang dijadwalkan untuk outlet ini hari ini', type: 'not_found' }],
          'Tidak ada karyawan yang dijadwalkan untuk outlet ini',
          404
        );
      }

      const attendance = await employeeService.checkin(
        employeeId,
        parseInt(String(outletId)), // Ensure outletId is a number
        imagePath,
        lateNotes,
        latePresentProof
      );
      const responseData: TAttendanceGetResponse = AttendanceResponseMapper.toResponse(attendance);

      return this.getSuccessResponse(
        res,
        {
          data: responseData,
          metadata: {} as TMetadataResponse,
        },
        'Check-in berhasil'
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal melakukan check-in';

      return this.handleError(
        res,
        error,
        errorMessage,
        500,
        null,
        {} as TMetadataResponse
      );
    }
  };

  /**
   * Employee checkout
   * POST /employee/checkout
   */
  checkout = async (req: AuthRequest, res: Response, employeeService: EmployeeService) => {
    try {
      const userId = req.user?.id;
      const outletId = req.user?.outlet_id;

      if (!userId || !outletId) {
        return this.getFailureResponse(
          res,
          { data: null, metadata: {} as TMetadataResponse },
          [{ field: 'authentication', message: 'User or outlet information not found', type: 'invalid' }],
          'Authentication error',
          401
        );
      }

      // Image path from uploaded file (validated by Zod schema)
      const imagePath = req.file?.filename ?? '';
      const employeeId = await employeeService.findScheduledEmployeeByUserId(parseInt(userId));

      if (!employeeId) {
        return this.getFailureResponse(
          res,
          { data: null, metadata: {} as TMetadataResponse },
          [{ field: 'employee', message: 'No employee scheduled for this outlet', type: 'not_found' }],
          'No employee scheduled for this outlet',
          404
        );
      }
      const outletRepository = new OutletRepository();
      const outlet = await outletRepository.findById(outletId);

      if (!outlet) {
        return this.getFailureResponse(
          res,
          { data: null, metadata: {} as TMetadataResponse },
          [{ field: 'outlet', message: 'Outlet not found', type: 'not_found' }],
          'Outlet not found',
          404
        );
      }
      const employeeRepository = new EmployeeRepository();
      const todayAttendance = await employeeRepository.findTodayAttendance(employeeId);

      if (!todayAttendance) {
        return this.getFailureResponse(
          res,
          { data: null, metadata: {} as TMetadataResponse },
          [{ field: 'attendance', message: 'No check-in record found for today', type: 'not_found' }],
          'No check-in record found for today',
          404
        );
      }
      const now = new Date();
      const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      const day = days[now.getDay()];
      const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      const setting = await outletRepository.getSettingForCheckin(outletId, day, currentTimeStr);

      if (!setting) {
        return this.getFailureResponse(
          res,
          { data: null, metadata: {} as TMetadataResponse },
          [{ field: 'setting', message: 'No outlet schedule found for today', type: 'not_found' }],
          'No outlet schedule found for today',
          404
        );
      }

      const attendance = await employeeService.checkout(
        employeeId,
        outletId,
        imagePath,
        setting.checkoutTime
      );

      const responseData: TAttendanceGetResponse = AttendanceResponseMapper.toResponse(attendance);

      return this.getSuccessResponse(
        res,
        {
          data: responseData,
          metadata: {} as TMetadataResponse,
        },
        'Check-out successful'
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to check out';

      return this.handleError(
        res,
        error,
        errorMessage,
        500,
        null,
        {} as TMetadataResponse
      );
    }
  };

  /**
   * Get attendances by outlet
   * GET /employee/schedule/:outletId
   */
  getAttendancesByOutlet = async (req: Request, res: Response, employeeService: EmployeeService) => {
    try {
      const { outletId } = req.params;
      const { date, page = '1', limit = '10' } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);

      const result = await employeeService.getAttendancesByOutlet(
        parseInt(outletId),
        date as string | undefined,
        pageNum,
        limitNum
      );

      // Apply ResponseMapper in Controller layer to transform raw data to API response format
      const mappedData = result.data.map(attendance =>
        AttendanceListResponseMapper.toResponse(attendance)
      );

      const metadata: TMetadataResponse = {
        page: pageNum,
        limit: limitNum,
        total_records: result.total,
        total_pages: Math.ceil(result.total / limitNum),
      };

      return this.getSuccessResponse(
        res,
        {
          data: mappedData,
          metadata,
        },
        'Attendances retrieved successfully'
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve attendances';

      return this.handleError(
        res,
        error,
        errorMessage,
        500,
        null,
        {} as TMetadataResponse
      );
    }
  };

  /**
   * Update late approval status
   * PATCH /employees/:id/:status
   */
  updateLateApprovalStatus = async (req: Request, res: Response, employeeService: EmployeeService) => {
    try {
      const { id, status } = req.params;
      const attendanceId = parseInt(id);

      if (isNaN(attendanceId)) {
        return this.getFailureResponse(
          res,
          { data: null, metadata: {} as TMetadataResponse },
          [{ field: 'id', message: 'Invalid attendance ID', type: 'invalid' }],
          'Invalid attendance ID',
          400
        );
      }
      const updatedAttendance = await employeeService.updateLateApprovalStatus(
        attendanceId,
        status as 'PENDING' | 'APPROVED' | 'REJECTED'
      );

      const responseData: TAttendanceGetResponse = AttendanceResponseMapper.toResponse(updatedAttendance);

      return this.getSuccessResponse(
        res,
        {
          data: responseData,
          metadata: {} as TMetadataResponse,
        },
        `Late approval status updated to ${status}`
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update late approval status';

      return this.handleError(
        res,
        error,
        errorMessage,
        500,
        null,
        {} as TMetadataResponse
      );
    }
  };

  /**
   * Generate Excel file for schedules with 2 sheets:
   * 1. Schedule Assignments (timeline view)
   * 2. Attendance Records (table view)
   */
  private async generateScheduleExcel(
    res: Response,
    schedules: TOutletAssignmentGetResponse[],
    attendance: TAttendanceTableResponse[]
  ) {
    try {
      const workbook = new ExcelJS.Workbook();

      // ===== SHEET 1: Schedule (Weekly Pivot Tables) =====
      const scheduleSheet = workbook.addWorksheet('Schedule');
      const outletMap = new Map<number, { name: string; location: string }>();
      const dateSet = new Set<string>();

      schedules.forEach((schedule: any) => {
        if (schedule.outlet_id && schedule.outlet_name) {
          outletMap.set(schedule.outlet_id, {
            name: schedule.outlet_name,
            location: schedule.outlet_location || ''
          });
        }
        if (schedule.assigned_at) {
          const date = new Date(schedule.assigned_at);
          const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
          dateSet.add(dateKey);
        }
      });

      // Sort dates
      const sortedDates = Array.from(dateSet).sort();

      // Group dates by week (ISO week number)
      const getWeekKey = (dateStr: string) => {
        const date = new Date(dateStr);
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
        // Adjust to Monday as first day (ISO week)
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(date);
        monday.setDate(date.getDate() + diffToMonday);
        return monday.toISOString().split('T')[0]; // Monday date as week key
      };

      const weekMap = new Map<string, string[]>();
      sortedDates.forEach(dateStr => {
        const weekKey = getWeekKey(dateStr);
        if (!weekMap.has(weekKey)) {
          weekMap.set(weekKey, []);
        }
        weekMap.get(weekKey)!.push(dateStr);
      });

      // Sort weeks
      const sortedWeeks = Array.from(weekMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
      const outlets = Array.from(outletMap.entries()).sort((a, b) => a[1].name.localeCompare(b[1].name));
      sortedWeeks.forEach(([weekKey, weekDates], weekIndex) => {
        if (weekIndex > 0) {
          scheduleSheet.addRow([]); // Empty row
          scheduleSheet.addRow([]); // Empty row
        }
        const headerRow: any[] = ['Outlet/Date'];
        weekDates.forEach(dateStr => {
          const date = new Date(dateStr);
          const dayName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][date.getDay()];
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          headerRow.push(`${dayName}, ${day}-${month}-${year}`);
        });

        const header = scheduleSheet.addRow(headerRow);
        styleHeaderRow(header);
        outlets.forEach(([outletId, outletInfo]) => {
          const row: any[] = [outletInfo.name];
          weekDates.forEach(dateStr => {
            const employeesOnDate = schedules
              .filter((s: any) => {
                if (!s.assigned_at || s.outlet_id !== outletId) return false;
                const scheduleDate = new Date(s.assigned_at).toISOString().split('T')[0];
                return scheduleDate === dateStr && s.is_active;
              })
              .map((s: any) => s.employee_name)
              .filter((name: string) => name); // Filter out null/undefined

            // Join multiple employees with comma or show dash
            const cellValue = employeesOnDate.length > 0
              ? employeesOnDate.join(', ')
              : '-';

            row.push(cellValue);
          });

          scheduleSheet.addRow(row);
        });
      });
      if (scheduleSheet.rowCount === 0) {
        scheduleSheet.addRow(['No schedules recorded for this period']);
      }

      autoSizeColumns(scheduleSheet);

      // ===== SHEET 2: Attendance Records =====
      const attendanceSheet = workbook.addWorksheet('Attendance');

      const attendanceHeaderRow = attendanceSheet.addRow([
        'Attendance ID',
        'Employee Name',
        'Outlet Name',
        'Check-in Time',
        'Check-out Time',
        'Attendance Status',
        'Late Minutes',
        'Late Approval Status',
        'Late Notes'
      ]);
      styleHeaderRow(attendanceHeaderRow);
      attendance.forEach((att: any) => {
        const checkinTime = att.checkin_time ? new Date(att.checkin_time).toLocaleString('id-ID') : '-';
        const checkoutTime = att.checkout_time ? new Date(att.checkout_time).toLocaleString('id-ID') : '-';

        attendanceSheet.addRow([
          att.id || '-',
          att.employee_name || '-',
          att.outlet_name || '-',
          checkinTime,
          checkoutTime,
          att.attendance_status || '-',
          att.late_minutes || 0,
          att.late_approval_status || '-',
          att.late_notes || '-'
        ]);
      });
      if (attendanceSheet.rowCount === 1) {
        attendanceSheet.addRow(['No attendance records for this period', '', '', '', '', '', '', '', '']);
      }

      autoSizeColumns(attendanceSheet);
      const filename = `schedule-attendance-${new Date().toISOString().split('T')[0]}.xlsx`;
      setExcelHeaders(res, filename);

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Error generating schedule Excel:', error);
      throw error;
    }
  }
}
