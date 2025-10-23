import { EntityMapConfig } from "../../adapters/postgres/repositories/Repository";

export const EmployeeMapperEntity: EntityMapConfig = {
  fields: [
    { dbField: "id", entityField: "id" },
    { dbField: "name", entityField: "name" },
    { dbField: "phone", entityField: "phone" },
    { dbField: "nik", entityField: "nik" },
    { dbField: "address", entityField: "address" },
    { dbField: "province_id", entityField: "provinceId" },
    { dbField: "city_id", entityField: "cityId" },
    { dbField: "district_id", entityField: "districtId" },
    { dbField: "subdistrict_id", entityField: "subdistrictId" },
    { dbField: "merital_status", entityField: "meritalStatus" },
    { dbField: "religion", entityField: "religion" },
    { dbField: "birth_date", entityField: "birthDate" },
    { dbField: "hire_date", entityField: "hireDate" },
    { dbField: "is_active", entityField: "isActive" },
    { dbField: "createdAt", entityField: "createdAt" },
    { dbField: "updatedAt", entityField: "updatedAt" },
  ],
  relations: [],
};
