/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import IResponseBase from "./response.interface";
import error from "../constants/error.constant";
import * as express from "express";

class ResponseBase {
  response: IResponseBase = {
    status: 200,
    success: true,
    message: "",
    payload: {},
  };
  /**
   * Sends Express response with provided status, message and data
   */
  public send = (resObj) => {
    this.response.status = resObj.status;
    this.response.success = resObj.success;
    this.response.message = resObj.message;
    this.response.payload = resObj.data;
    resObj.res.json(this.response);
  };
  /**
   * Sends Express Response with 500 Server error and err detail as data.
   */
  public sendServerError = (res: express.Response, err: string) => {
    const resObj = {
      res,
      status: error.error.ServerError.status,
      message: error.error.ServerError.message,
      data: err,
    };
    this.send(resObj);
  };
  /**
   * Sends exress response with 404(status) not found(msg).
   */
  public sendNotFound = (res) => {
    const resObj = {
      res,
      status: error.error.ResourceNotFound.status,
      message: error.error.ResourceNotFound.message,
      data: {},
    };
    this.send(resObj);
  };
  /**
   * Sends exress response with 401(status) not authorized(msg).
   */
  public sendNotAuthorized = (res: express.Response) => {
    const resObj = {
      res,
      status: error.error.NotAuthorized.status,
      message: error.error.NotAuthorized.message,
      data: {},
    };
    this.send(resObj);
  };
  /**
   * Sends exress response with 400(status) Bad Request(msg).
   */
  public sendBadRequest = (res: express.Response, err: string) => {
    const resObj = {
      res,
      status: error.error.BadRequest.status,
      message: err,
      data: {},
    };
    this.send(resObj);
  };
  /**
   * Sends express response with 401(status) Invalid Token
   */
  public invalidToken = (res: express.Response) => {
    const resObj = {
      res,
      status: error.error.InvalidToken.status,
      message: error.error.InvalidToken.message,
      data: {},
    };
    this.send(resObj);
  };
  /**
   * Sends express response with 403(status) Access Denied
   */
  public accessDenied = (res: express.Response) => {
    const resObj = {
      res,
      status: error.error.AccessDenied.status,
      message: error.error.AccessDenied.message,
      data: {},
    };
    this.send(resObj);
  };
}

export default ResponseBase;
