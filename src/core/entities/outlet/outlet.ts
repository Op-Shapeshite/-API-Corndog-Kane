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

export type TOutletWithSettings = TOutlet & {
  checkinTime: string | null;
  checkoutTime: string | null;
  salary: number | null;
}

export type TOutletCreateRequest = Omit<
	TOutletWithSettings,
	"id" | "createdAt" | "updatedAt" | "isActive" | "picName" | "picPhone" | "checkinTime" | "checkoutTime" 
> & {
	is_active: boolean;
	pic_name: string;
  pic_phone: string;
  setting: {
    checkin_time: string | null;
    checkout_time: string | null;
    salary: number | null;
  };
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

export type TOutletGetResponseWithSettings = Omit<TOutletWithSettings, 'isActive' | 'createdAt' | 'updatedAt'> & {
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
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
  settings?: TOutletSettingsUpdateRequest;
}

