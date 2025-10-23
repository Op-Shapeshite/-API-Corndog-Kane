import { TEmployee } from "../../../core/entities/employee/employee";
import { EmployeeRepository as IEmployeeRepository } from "../../../core/repositories/employee";
import Repository from "./Repository";

export default class EmployeeRepository
  extends Repository<TEmployee>
  implements IEmployeeRepository
{
  constructor() {
    super("employee");
  }
}
