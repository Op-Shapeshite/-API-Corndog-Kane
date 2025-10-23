import { Request, Response } from "express";
import { TMetadataResponse } from "../../../core/entities/base/response";
import { TOutletAssignmentGetResponse } from "../../../core/entities/outlet/assignment";
import { TOutletCreateRequest, TOutletGetResponse, TOutletGetResponseWithSettings, TOutletUpdateRequest, TOutletWithSettings } from "../../../core/entities/outlet/outlet";
import OutletService from "../../../core/services/OutletService";
import EmployeeService from "../../../core/services/EmployeeService";
import Controller from "./Controller";
import { OutletResponseMapper } from "../../../mappers/response-mappers/OutletResponseMapper";
import { OutletAssignmentResponseMapper } from "../../../mappers/response-mappers/OutletAssignmentResponseMapper";
import { ServiceFactory } from "../../../core/factories/ServiceFactory";
import { EventEmitter } from "../../../core/events/EventEmitter";
import { Events } from "../../../core/events/EventTypes";
import { OutletExistsValidationStrategy, EmployeeExistsValidationStrategy } from "../../../core/strategies/EntityValidationStrategies";

/**
 * OutletController - Demonstrates all design patterns
 * - Factory Pattern: ServiceFactory for service creation
 * - Chain of Responsibility: Error handling in base Controller
 * - Strategy Pattern: Validation strategies for entity existence
 * - Observer Pattern: Event emission for business events
 * - Specification Pattern: Available for complex queries
 * - Builder Pattern: Available for complex object creation
 * - Dependency Injection: Can use Container instead of Factory
 */

export class OutletController extends Controller<
	| TOutletGetResponse
	| TOutletGetResponseWithSettings
	| TOutletAssignmentGetResponse,
	TMetadataResponse
> {
	private outletService: OutletService;
	private employeeService: EmployeeService;

	constructor() {
		super();
		// Using Factory Pattern for service creation
		this.outletService = ServiceFactory.getOutletService();
		this.employeeService = ServiceFactory.getEmployeeService();
		
		// Alternative: Using DI Container (can switch between Factory and Container)
		// this.outletService = Container.resolve<OutletService>('OutletService');
		// this.employeeService = Container.resolve<EmployeeService>('EmployeeService');
	}

	findById = async (req: Request, res: Response): Promise<Response> => {
		const { id } = req.params;
		const outlet = (await this.outletService.findById(
			id
		)) as TOutletWithSettings | null;
		return this.getSuccessResponse(
			res,
			{
				data:
					outlet !== null
						? OutletResponseMapper.toDetailResponse(outlet)
						: ({} as TOutletGetResponseWithSettings),
				metadata: {} as TMetadataResponse,
			},
			"Outlet retrieved successfully"
		);
	};
	// overide create method

	createOutlet = async (req: Request, res: Response): Promise<Response> => {
		try {
			const outletData = req.body as TOutletCreateRequest;
			const newOutlet = (await this.outletService.createOutlet({
				checkinTime: outletData.setting.checkin_time,
				checkoutTime: outletData.setting.checkout_time,
				description: outletData.description,
				isActive: outletData.is_active,
				location: outletData.location,
				name: outletData.name,
				picName: outletData.pic_name,
				picPhone: outletData.pic_phone,
				salary: +outletData.setting.salary,
				user: outletData.user,
				userId: outletData.user_id || 0,
			})) as TOutletWithSettings;
			return this.getSuccessResponse(
				res,
				{
					data: OutletResponseMapper.toDetailResponse(newOutlet),
					metadata: {} as TMetadataResponse,
				},
				"Outlet created successfully"
			);
		} catch (error) {
			return this.handleError(
				res,
				error,
				"Failed to create outlet",
				500,
				{} as TOutletGetResponse,
				{} as TMetadataResponse
			);
		}
	};
  updateOutlet = async (req: Request, res: Response): Promise<Response> => {
    try {
      
      const { id } = req.params;
      const outletData = req.body as TOutletUpdateRequest;
	  let setting = outletData.setting || {};
	  if (Object.keys(setting).length > 0) {
		setting = {
		  checkInTime: setting.checkin_time,
		  checkOutTime: setting.checkout_time,
		  salary: setting.salary == null ? null : +setting.salary,
		} as { checkInTime?: string | null; checkOutTime?: string | null; salary?: number | null };
		
	  }
      const updatedOutlet = (await this.outletService.updateOutlet(+id, {
        ...setting,
        description: outletData.description,
        isActive: outletData.is_active,
        location: outletData.location,
        name: outletData.name,
        picName: outletData.pic_name,
        picPhone: outletData.pic_phone,
        userId: outletData.user_id,
      })) as TOutletWithSettings;
      
      if (!updatedOutlet) {
        return this.getFailureResponse(
          res,
          { data: {} as TOutletGetResponse, metadata: {} as TMetadataResponse },
          [{ field: 'id', message: 'Outlet not found', type: 'not_found' }],
          'Outlet not found',
          404
        );
      }
      
      return this.getSuccessResponse(
        res,
        {
          data: OutletResponseMapper.toListResponse(updatedOutlet as TOutletWithSettings),
          metadata: {} as TMetadataResponse,
        },
        'Outlet updated successfully'
      );
    } catch (error){
      return this.handleError(
        res,
        error,
        "Failed to update outlet",
        500,
        {} as TOutletGetResponse,
        {} as TMetadataResponse
      );
    }
	}

	assignEmployeeToOutlet = async (req: Request, res: Response): Promise<Response> => {
		try {
			const outletId = parseInt(req.params.id);
			const employeeId = parseInt(req.params.employeeid);
			const { date, is_for_one_week } = req.body;

			// Using Strategy Pattern for validation - validate outlet
			const outletValidation = await new OutletExistsValidationStrategy().validate({ outletId });
			if (!outletValidation.isValid) {
				return this.getFailureResponse(
					res,
					{ data: {} as TOutletGetResponse, metadata: {} as TMetadataResponse },
					outletValidation.errors,
					'Outlet not found',
					404
				);
			}

			// Validate employee
			const employeeValidation = await new EmployeeExistsValidationStrategy().validate({ employeeId });
			if (!employeeValidation.isValid) {
				return this.getFailureResponse(
					res,
					{ data: {} as TOutletGetResponse, metadata: {} as TMetadataResponse },
					employeeValidation.errors,
					'Employee not found',
					404
				);
			}

			const assignments = await this.outletService.assignEmployeeToOutletForDates(
				outletId,
				employeeId,
				new Date(date),
				is_for_one_week
			);

			// Using Observer Pattern - emit event for each assignment
			for (const assignment of assignments) {
				await EventEmitter.emit(Events.EMPLOYEE_ASSIGNED, {
					assignment,
					outletId,
					employeeId,
					timestamp: new Date()
				});
			}

			const responseData = assignments.map((assignment) =>
				OutletAssignmentResponseMapper.toListResponse(assignment)
			);

			return this.getSuccessResponse(
				res,
				{
					data: responseData as unknown as TOutletGetResponse,
					metadata: {} as TMetadataResponse,
				},
				"Employee assigned to outlet successfully"
			);
		} catch (error) {
			return this.handleError(
				res,
				error,
				"Failed to assign employee to outlet",
				500,
				{} as TOutletGetResponse,
				{} as TMetadataResponse
			);
		}
	};
	
}