import { TUserCreateRequest } from "../user/user";

export type TOutlet = {
  id: string;
  name: string;
  location: string;
  picName: string;
  picPhone: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export type TOutletCreate = Omit<TOutlet, "id" | "createdAt" | "updatedAt"> & {
	checkinTime: string;
	checkoutTime: string;
	salary: number;
	userId?: number;
	user?: {
		name: string;
		username: string;
		password: string;
		role_id: number;
		is_active: boolean;
	};
};



export type TOutletWithSettings = TOutlet & {
  checkinTime: string ;
  checkoutTime: string ;
  salary: number ;
}

export type TOutletCreateRequest = Omit<
	TOutletWithSettings,
	"id" | "createdAt" | "updatedAt" | "isActive" | "picName" | "picPhone" | "checkinTime" | "checkoutTime" 
> & {
	is_active: boolean;
	pic_name: string;
  pic_phone: string;
  setting: {
    checkin_time: string ;
    checkout_time: string ;
    salary: number ;
  };
  user?: TUserCreateRequest
  user_id?: number;
};
export type TOutletCreateRequestWithUser = TOutletCreateRequest & {
  user: TUserCreateRequest;
}
export type TOutletCreateRequestWithUserId = TOutletCreateRequest & {
  user_id: string;
}


export type TOutletGetResponse = Omit<TOutlet, 'isActive' | 'createdAt' | 'updatedAt'| 'picName' | 'picPhone'> & {
  is_active: boolean; 
  pic_name: string;
  pic_phone: string;
  created_at: Date;
  updated_at: Date;
}

export type TOutletGetResponseWithSettings = Omit<TOutletWithSettings, 'isActive' | 'createdAt' | 'updatedAt' | 'picName' | 'picPhone' | 'checkinTime' |'checkoutTime'> & {
  checkin_time: string | null;
  checkout_time: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  pic_name: string;
  pic_phone: string;
}

export type TOutletSettingsUpdateRequest = {
  checkin_time?: string | null;
  checkout_time?: string | null;
  salary?: number | null;
}

export type TOutletUpdateRequest = {
  name?: string;
  location?: string;
  description?: string;
  is_active?: boolean;
  pic_name?: string;
  pic_phone?: string;
  setting?: TOutletSettingsUpdateRequest;
  user_id?: number;
}

export type TOutletUpdate = Omit<TOutlet, "id" | "createdAt" | "updatedAt"> & {
	checkInTime?: string | null;
	checkOutTime?: string | null;
  salary?: number | null;
  userId?: number;
};