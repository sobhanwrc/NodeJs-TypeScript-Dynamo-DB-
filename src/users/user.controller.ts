import * as express from 'express';
import * as UserService from './user.service';
import * as jwt from 'jsonwebtoken';

import RequestBase from '../response/response.controller';
import { IResponse } from '../interfaces/response.interface';
import { message } from '../constants/message.constant';
import authMiddleware from '../middleware/auth.middleware'
import userAddValidation from "../middleware/validator/UserValidatation.middleware"
import {userStatusChangedValidation, userUpdateValidation, userRegistrationValidation, userLoginValidation} from "../middleware/validator/UserValidatation.middleware"

class RestaurantController extends RequestBase {
  public path = '/api';
  public router = express.Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/add-user`, userAddValidation, this.addUsers);
    this.router.get(`${this.path}/lists-user`, authMiddleware, this.getAllUsers);
    this.router.put(`${this.path}/update-user/:userId`, authMiddleware, userUpdateValidation, this.updateUser);
    this.router.delete(`${this.path}/delete-user/:userId`, authMiddleware, this.deleteUser);
    this.router.put(`${this.path}/activate-deactivate-user/:userId`, authMiddleware, userStatusChangedValidation, this.activateOrDeactivateUser);
    this.router.post(`${this.path}/user-registration`, userRegistrationValidation, this.registration);
    this.router.post(`${this.path}/user-login`, userLoginValidation, this.login);
  }

  private registration = async (req: express.Request, res: express.Response) => {
    try {
      const result = await UserService.registration(req.body);
      if(result){

        const resObj: IResponse = {
          res: res,
          status: 200,
          message: message.success.USR_REG,
          data: result
        }
        this.send(resObj);
      }else{
        res.status(200).send({
          "status": 200,
          "message": "User is already exist.",
          "data" : {}
        })
      }
    } catch (e) {
      this.sendServerError(res, e.message);
    }
  }

  private login = async (req: express.Request, res: express.Response) => {
    try {
      const result = await UserService.login(req.body);
      if(result.status === true){
        //#region Generate auth token
        const jwtExpiresIn = process.env.JWT_EXPIRES; // 1 DAY
        const secret = process.env.JWT_SECRET;

        const tokenObj = {
          SK : result.data.SK,
          PK : result.data.PK,
        }

        const generateToken = jwt.sign(tokenObj, secret,{ expiresIn : jwtExpiresIn });
        //#endregion

        const resObj: IResponse = {
          res: res,
          status: 200,
          message: message.success.USR_LOGIN,
          data: {
            userData : result.data,
            authToken: generateToken,
          }
        }
        this.send(resObj);
      }else{
        res.status(200).send({
          "status": 200,
          "message": result.message,
          "data" : {}
        })
      }
    } catch (error) {
      this.sendServerError(res, error.message);
    }
  }

  private addUsers = async (req: express.Request, res: express.Response) => {
    try {
      const result = await UserService.createUsers(req.body);
      if(result){

        const resObj: IResponse = {
          res: res,
          status: 200,
          message: message.success.USR_ADD,
          data: result
        }
        this.send(resObj);
      }else{
        res.status(200).send({
          "status": 200,
          "message": "User is already exist.",
          "data" : {}
        })
      }
    } catch (e) {
      this.sendServerError(res, e.message);
    }
  }

  private getAllUsers = async (req: express.Request, res: express.Response) => {
    try {
      let restaurants = await UserService.getAllUsers();

      const resObj: IResponse = {
        res: res,
        status: 200,
        message: message.success.USR_GET,
        data: restaurants
      }
      this.send(resObj);
    } catch (e) {
      this.sendServerError(res, e.message);
    }
  }

  private updateUser = async (req: express.Request, res: express.Response) => {
    try {
      const saveQueryParams = {
        firstName: req.body.firstName,
        lastName  : req.body.lastName,
        mobileNumber  : req.body.mobileNumber,
        userRole  : req.body.userRole,
        userStatus  : req.body.status,
        updatedOn : new Date().toUTCString(),
      };
      const result = await UserService.updateUser(req.params.userId, saveQueryParams);

      const resObj: IResponse = {
        res: res,
        status: 200,
        message: message.success.USR_UPDATE,
        data: result
      }
      this.send(resObj);
    } catch (e) {
      this.sendServerError(res, e.message);
    }
  }

  private deleteUser = async (req: express.Request, res: express.Response) => {
    try {
      const restaurant = await UserService.deleteUser(req.params.userId);

      const resObj: IResponse = {
        res: res,
        status: 200,
        message: message.success.USR_DELETE,
        data: restaurant
      }
      this.send(resObj);
    } catch (e) {
      this.sendServerError(res, e.message);
    }
  }

  private activateOrDeactivateUser = async(req: express.Request, res : express.Response) => {
    try {
      const saveQueryParams = {
        user_status: req.body.status
      };
      const result = await UserService.activateOrDeactivateUser(req.params.userId, saveQueryParams);

      if(result){

        const resObj: IResponse = {
          res: res,
          status: 200,
          message: message.success.USR_UPDATE,
          data: result
        }
        this.send(resObj);
      }else{
        res.status(200).send({
          "status": 200,
          "message": "User not found.",
          "data" : {}
        })
      }
    } catch (e) {
      this.sendServerError(res, e.message);
    }
  }

}

export default RestaurantController;