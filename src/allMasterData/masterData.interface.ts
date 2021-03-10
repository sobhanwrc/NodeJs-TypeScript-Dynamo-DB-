export class IPermissionObj {
  PK: string;
  SK: string;
  perName: string;
  perType ?: string;
}

export interface IPermissionSuccessResponse {
  status: boolean;
  message: string;
  data?: IPermissionObj | Array<IPermissionObj>;
}
