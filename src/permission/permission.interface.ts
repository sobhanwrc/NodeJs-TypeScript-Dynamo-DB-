/* eslint-disable @typescript-eslint/no-explicit-any */
import { UUID } from "aws-sdk/clients/inspector";

export class PermissionMapping {
  permissionSet?: any;
  roleId?: UUID;
  SK?: string;
  PK?: string;
  createdOn?: string;
  updatedOn?: string;
}
export interface IPermissionMappingErrorResponse {
  status: boolean;
  message: string;
  data?: string;
}
export interface IPermissionMappingSuccessResponse {
  status: boolean;
  message: string;
  data?: PermissionMapping | Array<PermissionMapping>;
}
