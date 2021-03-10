/* eslint-disable @typescript-eslint/no-explicit-any */
export class IAuditLogObj {
  roleId: string;
  entity: string;
  event: string;
  objOldData: any;
  objNewData: any;
  createdOn: string;
  updatedOn: string;
}
