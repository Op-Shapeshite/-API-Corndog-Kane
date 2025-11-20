import { TPayrollListResponse, TPayrollDetailResponse, TPayrollSlipResponse } from "../../core/entities/payroll/payroll";

export class PayrollListResponseMapper {
  static map(data: any[]): TPayrollListResponse[] {
    return data;
  }
}

export class PayrollDetailResponseMapper {
  static map(data: any): TPayrollDetailResponse {
    return data;
  }
}

export class PayrollSlipResponseMapper {
  static map(data: any): TPayrollSlipResponse {
    return data;
  }
}
