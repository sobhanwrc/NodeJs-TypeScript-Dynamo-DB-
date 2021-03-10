import { UUID } from "aws-sdk/clients/inspector";
import { User } from "../users/user.interface";

export class Role {
  roleStatus = true;
  description = "";
  roleName = "";
  roleId?: UUID;
  SK?: string;
  PK?: string;
  createdOn?: string;
  updatedOn?: string;
}
export interface IRoleErrorResponse {
  status: boolean;
  message: string;
  data?: string;
}
export interface IRoleSuccessResponse {
  status: boolean;
  message: string;
  data?: Role | Array<Role>;
}

export interface IAssignRole {
  roleId: UUID;
  userIds: Array<User>;
}
