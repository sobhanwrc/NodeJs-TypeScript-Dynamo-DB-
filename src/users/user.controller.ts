import * as express from 'express';
import * as UserService from './user.service';
import * as jwt from 'jsonwebtoken';

import RequestBase from '../response/response.controller';
import { IResponse } from '../interfaces/response.interface';
import { message } from '../constants/message.constant';
import authMiddleware from '../middleware/auth.middleware'
import userAddValidation from "../middleware/validator/UserValidatation.middleware"
import {userStatusChangedValidation, userUpdateValidation, userRegistrationValidation, userLoginValidation, userForgotPasswordValidation, userForgotPasswordUpdateValidation} from "../middleware/validator/UserValidatation.middleware"

class RestaurantController extends RequestBase {
  public path = '/api';
  public router = express.Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/add-user`, authMiddleware, userAddValidation, this.addUsers);
    this.router.get(`${this.path}/lists-user`, authMiddleware, this.getAllUsers);
    this.router.put(`${this.path}/update-user/:userId`, authMiddleware, userUpdateValidation, this.updateUser);
    this.router.delete(`${this.path}/delete-user/:userId`, authMiddleware, this.deleteUser);
    this.router.put(`${this.path}/activate-deactivate-user/:userId`, authMiddleware, userStatusChangedValidation, this.activateOrDeactivateUser);
    this.router.post(`${this.path}/user-registration`, userRegistrationValidation, this.registration);
    this.router.post(`${this.path}/user-login`, userLoginValidation, this.login);
    this.router.post(`${this.path}/user-forgot-password-request`, userForgotPasswordValidation, this.forgotPassword);
    this.router.put(`${this.path}/user-forgot-password-update`, userForgotPasswordUpdateValidation, this.forgotPasswordUpdate);
    this.router.get(`${this.path}/user-email-verified/:userId`, this.emailVerificationForRegistration)
  }

  private registration = async (req: express.Request, res: express.Response) => {
    try {
      const userRegistration = await UserService.registration(req.body);
      if(userRegistration){

        const resObj: IResponse = {
          res: res,
          status: 200,
          message: message.success.USR_REG,
          data: userRegistration
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
      const userLoggedIn = await UserService.login(req.body);
      if(userLoggedIn.status === true){
        //#region Generate auth token
        const jwtExpiresIn = process.env.JWT_EXPIRES; // 1 DAY
        const secret = process.env.JWT_SECRET;

        const tokenObj = {
          SK : userLoggedIn.data.SK,
          PK : userLoggedIn.data.PK,
        }
        const generateToken = jwt.sign(tokenObj, secret,{ expiresIn : jwtExpiresIn });

        //#endregion

        const resObj: IResponse = {
          res: res,
          status: 200,
          message: message.success.USR_LOGIN,
          data: {
            userData : userLoggedIn.data,
            authToken: generateToken,
          }
        }
        this.send(resObj);
      }else{
        res.status(200).send({
          "status": 200,
          "message": userLoggedIn.message,
          "data" : {}
        })
      }
    } catch (error) {
      this.sendServerError(res, error.message);
    }
  }

  private addUsers = async (req: express.Request, res: express.Response) => {
    try {
      const addUser = await UserService.createUsers(req.body);
      if(addUser){

        const resObj: IResponse = {
          res: res,
          status: 200,
          message: message.success.USR_ADD,
          data: addUser
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
      let getAllUsers = await UserService.getAllUsers();

      const resObj: IResponse = {
        res: res,
        status: 200,
        message: message.success.USR_GET,
        data: getAllUsers
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
      const updateUser = await UserService.updateUser(req.params.userId, saveQueryParams);

      const resObj: IResponse = {
        res: res,
        status: 200,
        message: message.success.USR_UPDATE,
        data: updateUser
      }
      this.send(resObj);
    } catch (e) {
      this.sendServerError(res, e.message);
    }
  }

  private deleteUser = async (req: express.Request, res: express.Response) => {
    try {
      const deleteUser = await UserService.deleteUser(req.params.userId);

      const resObj: IResponse = {
        res: res,
        status: 200,
        message: message.success.USR_DELETE,
        data: deleteUser
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
          "message": message.error.USER_NOT_FOUND,
          "data" : {}
        })
      }
    } catch (e) {
      this.sendServerError(res, e.message);
    }
  }

  private forgotPassword = async (req: express.Request, res : express.Response) => {
    try {
      const emailId = req.body.emailId
      const userIsExist = await UserService.fetchUserByEmailOrUserId(emailId);

      if(userIsExist){
        //#region sent email for forgot password link
        //#endregion
        res.send({
          status : 200,
          message : "Link sent successfully.",
          payload : true
        });
      }else{
        res.status(200).send({
          "status": 200,
          "message": message.error.USER_NOT_FOUND,
          "data" : {}
        })
      }
    } catch (error) {
      this.sendServerError(res, error.message);
    }
  }

  private forgotPasswordUpdate = async (req: express.Request, res : express.Response) => {
    try {
      const updateQueryParams = {
        emailId: req.body.emailId,
        password : req.body.password,
        confirmPassword : req.body.confirmPassword,
        updatedOn : new Date().toUTCString()
      };
      const updateResp = await UserService.forgotPasswordUpdate(updateQueryParams);
      const resObj: IResponse = {
        res: res,
        status: 200,
        message: message.success.USR_FORGOT_PASSWORD_UPDATE,
        data: updateResp
      }
      this.send(resObj);
    } catch (error) {
      this.sendServerError(res, error.message);
    }
  }

  private emailVerificationForRegistration = async (req: express.Request, res : express.Response) => {
    try {
      const userId = req.params.userId
      const userIsExist = await UserService.fetchUserByEmailOrUserId(userId);
      if(userIsExist){
        //#region update user detail for verified email
        const updatedObj = {
          userId : req.params.userId,
          emailVerified : true,
          updatedOn : new Date().toUTCString()
        }
        const updateUserData = await UserService.updateEmailVerifiedField(updatedObj);
        //#endregion
        if(updateUserData){
          /**Sent welcome mail */
          await UserService.welcomeEmailSent(userId);
          res.send("Thank You! email verified successfully.")
        }
      }
    } catch (error) {
      this.sendServerError(res, error.message);
    }
  }

}

export default RestaurantController;