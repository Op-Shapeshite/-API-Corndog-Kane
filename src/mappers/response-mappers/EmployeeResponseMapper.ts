import { TEmployee, TEmployeeGetResponse } from "../../core/entities/employee/employee";

export class EmployeeResponseMapper {
  static toListResponse(employee: TEmployee): TEmployeeGetResponse {
    return {
      id: employee.id,
      name: employee.name,
      phone: employee.phone,
      nik: employee.nik,
      address: employee.address,
      province_id: employee.provinceId,
      city_id: employee.cityId,
      district_id: employee.districtId,
      subdistrict_id: employee.subdistrictId,
      merital_status: employee.meritalStatus,
      religion: employee.religion,
      birth_date: employee.birthDate,
      hire_date: employee.hireDate,
      is_active: employee.isActive,
      created_at: employee.createdAt,
      updated_at: employee.updatedAt,
    };
  }
}
