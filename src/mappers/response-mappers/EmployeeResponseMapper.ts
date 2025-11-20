import { TEmployee, TEmployeeGetResponse } from "../../core/entities/employee/employee";

export class EmployeeResponseMapper {
  static toResponse(employee: TEmployee): TEmployeeGetResponse {
    return {
      id: employee.id,
      nik: employee.nik,
      name: employee.name,
      phone: employee.phone,
      address: employee.address,
      province_id: employee.provinceId?.toString() || '',
      city_id: employee.cityId?.toString() || '',
      district_id: employee.districtId?.toString() || '',
      subdistrict_id: employee.subdistrictId?.toString() || '',
      merital_status: employee.meritalStatus,
      religion: employee.religion,
      birth_date: employee.birthDate,
      birth_place: employee.birthPlace,
      blood_type: employee.bloodType,
      rt: employee.rt,
      rw: employee.rw,
      work_type: employee.workType,
      position: employee.position,
      notes: employee.notes,
      image_path: employee.imagePath,
      gender: employee.gender,
      hire_date: employee.hireDate,
      is_active: employee.isActive,
      created_at: employee.createdAt,
      updated_at: employee.updatedAt,
    };
  }

  static toListResponse(employees: TEmployee[]): TEmployeeGetResponse[] {
    return employees.map(employee => this.toResponse(employee));
  }
}
