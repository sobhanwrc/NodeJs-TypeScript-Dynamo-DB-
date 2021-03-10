import { UUID } from "aws-sdk/clients/inspector";

export class Bumpers {
  SK?: string;
  PK?: string;
  bumperName?: string;
  advertiserId?: UUID;
  brandId?: UUID;
  categoryId?: UUID;
  productId?: UUID;
  video?: string;
  isActive?: boolean;
  sequenceNo?: number;
  thumbnail?: string;
  createdOn?: string;
  updatedOn?: string;
}
export interface IBumpersErrorResponse {
  status: boolean;
  message: string;
  data?: string;
}
export interface IBumpersSuccessResponse {
  status: boolean;
  message: string;
  data?: Bumpers | Array<Bumpers>;
}

export interface ISequenceNo {
  sequenceNo?: number;
}
