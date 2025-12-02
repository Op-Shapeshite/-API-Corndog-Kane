import { Response } from "express";
import { AuthRequest } from "../../../policies";
import Controller from "./Controller";

type TAuthTestData = {
  id: string;
  username: string;
  role: string;
};

type TAuthTestMetadata = {
  timestamp: string;
};

export class TestController extends Controller<TAuthTestData, TAuthTestMetadata> {
  authTest = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return this.getFailureResponse(
          res,
          { data: {} as TAuthTestData, metadata: {} as TAuthTestMetadata },
          [{ field: 'user', message: 'Anda belum login ke sistem', type: 'invalid' }],
          'Anda belum login ke sistem',
          401
        );
      }

      return this.getSuccessResponse(
        res,
        {
          data: {
            id: req.user.id,
            username: req.user.username,
            role: req.user.role,
          },
          metadata: {
            timestamp: new Date().toISOString(),
          }
        },
        'Pengujian autentikasi berhasil'
      );
    } catch (error) {
      console.error('Auth test error:', error);
      return this.getFailureResponse(
        res,
        { data: {} as TAuthTestData, metadata: {} as TAuthTestMetadata },
        [{ field: 'server', message: 'Terjadi kesalahan pada server', type: 'internal_error' }],
        'Terjadi kesalahan pada server',
        500
      );
    }
  };
}
