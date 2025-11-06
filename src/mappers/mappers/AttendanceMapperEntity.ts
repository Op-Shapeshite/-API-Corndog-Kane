import { EntityMapConfig } from "../../adapters/postgres/repositories/Repository";

export const AttendanceMapperEntity: EntityMapConfig = {
  fields: [
    { dbField: 'id', entityField: 'id' },
    { dbField: 'employee_id', entityField: 'employeeId' },
    { dbField: 'outlet_id', entityField: 'outletId' },
    { dbField: 'checkin_image_proof', entityField: 'checkinImageProof' },
    { dbField: 'checkout_image_proof', entityField: 'checkoutImageProof' },
    { dbField: 'checkin_time', entityField: 'checkinTime' },
    { dbField: 'checkout_time', entityField: 'checkoutTime' },
    { dbField: 'is_active', entityField: 'isActive' },
    { dbField: 'createdAt', entityField: 'createdAt' },
    { dbField: 'updatedAt', entityField: 'updatedAt' },
  ],
  relations: [],
};
