/* eslint-disable @typescript-eslint/no-explicit-any */
import * as express from "express";

export interface IUserData {
  _id: string;
  companyCode2: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  token: string;
  company: string;
}

export interface ISubcategoryData {
  _id: string;
  categoryId: string;
  name: string;
  description: string;
  imageURL: string;
  status: boolean;
}

export interface ICategoryData {
  _id: string;
  name: string;
  description: string;
  imageURL: string;
  status: boolean;
}

export interface IItemData {
  _id: string;
  name: string;
  description: string;
  imageURL: string;
  status: boolean;
  price: number;
  quantity: number;
  subcategory: ISubcategoryData;
  category: ICategoryData;
}

export interface IResponse {
  res: express.Response;
  status: number;
  success: boolean;
  message: string;
  data: any;
}

export interface ICartDetails {
  totalQuantity: number;
  subTotal: number;
}
export interface ICartReturnData {
  returnData: ICartDetails;
}
