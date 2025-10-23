export enum MeritalStatus {
  SINGLE = "SINGLE",
  MARRIED = "MARRIED",
  DIVORCED = "DIVORCED",
  WIDOWED = "WIDOWED"
}

export type TEmployee = {
  id: string;
  name: string;
  phone: string;
  nik: string;
  address: string;
  provinceId: number;
  cityId: number;
  districtId: number;
  subdistrictId: number;
  meritalStatus: MeritalStatus;
  religion: string;
  birthDate: Date;
  hireDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type TEmployeeCreate = Omit<TEmployee, "id" | "createdAt" | "updatedAt">;

export type TEmployeeCreateRequest = Omit<TEmployee, "id" | "createdAt" | "updatedAt" | "isActive" | "provinceId" | "cityId" | "districtId" | "subdistrictId" | "meritalStatus" | "birthDate" | "hireDate"> & {
  is_active?: boolean;
  province_id: number;
  city_id: number;
  district_id: number;
  subdistrict_id: number;
  merital_status: MeritalStatus;
  birth_date: Date;
  hire_date: Date;
}

export type TEmployeeUpdateRequest = Partial<TEmployeeCreateRequest>;

export type TEmployeeGetResponse = Omit<TEmployee, "isActive" | "createdAt" | "updatedAt" | "provinceId" | "cityId" | "districtId" | "subdistrictId" | "meritalStatus" | "birthDate" | "hireDate"> & {
  is_active: boolean;
  province_id: number;
  city_id: number;
  district_id: number;
  subdistrict_id: number;
  merital_status: MeritalStatus;
  birth_date: Date;
  hire_date: Date;
  created_at: Date;
  updated_at: Date;
}
