/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from 'express';

interface IResponse {
  res: Response;
  code: number;
  data?: any[];
  message?: string;
}
/**
 * @param {Response} res
 * @param {number} code
 * @param {any[]} data
 * @param {string} message
 * @returns {Response}
 * @description This function is used to send response to client
 **/
export default ({ res, code, data, message }: IResponse): Response => 
  res.status(code).json({
    code,
    message,
    data,
  });