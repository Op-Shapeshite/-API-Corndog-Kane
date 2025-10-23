import { TEmployeeCreate, MeritalStatus } from "../entities/employee/employee";

/**
 * Builder Pattern: EmployeeBuilder
 * Simplifies creation of Employee objects with validation
 */
export class EmployeeBuilder {
  private employee: Partial<TEmployeeCreate> = {
    isActive: true // Default value
  };

  /**
   * Set employee name (required)
   */
  setName(name: string): this {
    this.employee.name = name;
    return this;
  }

  /**
   * Set employee phone
   */
  setPhone(phone: string): this {
    this.employee.phone = phone;
    return this;
  }

  /**
   * Set employee NIK
   */
  setNik(nik: string): this {
    this.employee.nik = nik;
    return this;
  }

  /**
   * Set employee address
   */
  setAddress(address: string): this {
    this.employee.address = address;
    return this;
  }

  /**
   * Set province ID
   */
  setProvinceId(provinceId: number): this {
    this.employee.provinceId = provinceId;
    return this;
  }

  /**
   * Set city ID
   */
  setCityId(cityId: number): this {
    this.employee.cityId = cityId;
    return this;
  }

  /**
   * Set district ID
   */
  setDistrictId(districtId: number): this {
    this.employee.districtId = districtId;
    return this;
  }

  /**
   * Set subdistrict ID
   */
  setSubdistrictId(subdistrictId: number): this {
    this.employee.subdistrictId = subdistrictId;
    return this;
  }

  /**
   * Set marital status
   */
  setMeritalStatus(status: MeritalStatus): this {
    this.employee.meritalStatus = status;
    return this;
  }

  /**
   * Set religion
   */
  setReligion(religion: string): this {
    this.employee.religion = religion;
    return this;
  }

  /**
   * Set birth date
   */
  setBirthDate(birthDate: Date): this {
    this.employee.birthDate = birthDate;
    return this;
  }

  /**
   * Set hire date
   */
  setHireDate(hireDate: Date): this {
    this.employee.hireDate = hireDate;
    return this;
  }

  /**
   * Set active status
   */
  setActive(isActive: boolean): this {
    this.employee.isActive = isActive;
    return this;
  }

  /**
   * Build the employee object
   * Validates required fields
   */
  build(): TEmployeeCreate {
    if (!this.employee.name) {
      throw new Error('Employee name is required');
    }

    if (!this.employee.birthDate) {
      throw new Error('Birth date is required');
    }

    if (!this.employee.hireDate) {
      throw new Error('Hire date is required');
    }

    return this.employee as TEmployeeCreate;
  }

  /**
   * Reset the builder to start fresh
   */
  reset(): this {
    this.employee = { isActive: true };
    return this;
  }
}
