import { Request, Response } from "express";
import OutletRepository from "../../../adapters/postgres/repositories/OutletRepository";
import { TMetadataResponse } from "../../../core/entities/base/response";
import { TOutletAssignmentGetResponse } from "../../../core/entities/outlet/assignment";
import { TOutletCreateRequest, TOutletGetResponse, TOutletGetResponseWithSettings, TOutletUpdateRequest, TOutletWithSettings } from "../../../core/entities/outlet/outlet";
import OutletService from "../../../core/services/OutletService";
import Controller from "./Controller";
import { OutletResponseMapper } from "../../../mappers/response-mappers/OutletResponseMapper";

export class OutletController extends Controller<
	| TOutletGetResponse
	| TOutletGetResponseWithSettings
	| TOutletAssignmentGetResponse,
	TMetadataResponse
> {
	private outletService: OutletService;

	constructor() {
		super();
		this.outletService = new OutletService(new OutletRepository());
	}

	async findById(req: Request, res: Response): Promise<Response> {
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
	}
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
}