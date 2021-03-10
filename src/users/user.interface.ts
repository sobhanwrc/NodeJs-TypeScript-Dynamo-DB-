import { UUID } from "aws-sdk/clients/inspector";
import { Role } from "../roles/role.interface";

export class User {
  userId?: string;
  firstName?: string;
  lastName?: string;
  emailId?: string;
  mobileNumber?: string;
  userStatus?: boolean;
  userRole?: UUID;
  password?: string;
  updatedOn?: string;
  createdOn?: string;
  SK?: string;
  PK?: string;
  emailVerified?: boolean;
  userType?: string;
  roleMaster?: Array<Role>;
}
export interface IUserErrorResponse {
  status: boolean;
  message: string;
  data?: string;
}
export interface IUserSuccessResponse {
  status: boolean;
  message: string;
  data?: User | Array<User>;
}

export interface IEmailVerifiedParam {
  userStatus: boolean;
}

export interface IForgotPasswordUpdateQueryParams {
  emailId: string;
  password: string;
  confirmPassword: string;
  updatedOn: string;
}

export interface IChangePasswordUpdateQueryParams {
  emailId: string;
  oldPassword: string;
  password: string;
  confirmPassword: string;
  updatedOn: string;
}

export interface IUserData {
  userType: string;
}
