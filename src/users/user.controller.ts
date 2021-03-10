import * as express from "express";
import * as UserService from "./user.service";
import * as jwt from "jsonwebtoken";

import RequestBase from "../response/response.controller";
import { IResponse } from "../interfaces/response.interface";
import { message } from "../constants/message.constant";
import authMiddleware from "../middleware/auth.middleware";
import userAddValidation from "../middleware/validator/UserValidatation.middleware";

import {
  userStatusChangedValidation,
  userUpdateValidation,
  userRegistrationValidation,
  userLoginValidation,
  userForgotPasswordValidation,
  userForgotPasswordUpdateValidation,
  userChangePasswordValidation,
  userListValidation,
} from "../middleware/validator/UserValidatation.middleware";

import { User } from "./user.interface";

class UserController extends RequestBase {
  public path = "/api";
  public router = express.Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/add-user`,
      authMiddleware,
      userAddValidation,
      this.addUsers
    );
    this.router.post(
      `${this.path}/lists-user`,
      authMiddleware,
      userListValidation,
      this.getAllUsers
    );
    this.router.put(
      `${this.path}/update-user`,
      authMiddleware,
      userUpdateValidation,
      this.updateUser
    );
    this.router.delete(
      `${this.path}/delete-user/:userId`,
      authMiddleware,
      this.deleteUser
    );
    this.router.put(
      `${this.path}/activate-deactivate-user`,
      authMiddleware,
      userStatusChangedValidation,
      this.activateOrDeactivateUser
    );
    this.router.post(
      `${this.path}/user-registration`,
      userRegistrationValidation,
      this.registration
    );
    this.router.post(
      `${this.path}/user-login`,
      userLoginValidation,
      this.login
    );
    this.router.post(
      `${this.path}/user-forgot-password-request`,
      userForgotPasswordValidation,
      this.forgotPassword
    );
    this.router.put(
      `${this.path}/user-forgot-password-update`,
      userForgotPasswordUpdateValidation,
      this.forgotPasswordUpdate
    );
    this.router.get(
      `${this.path}/user-email-verified/:userId`,
      this.emailVerificationForRegistration
    );

    this.router.post(
      `${this.path}/change-password`,
      authMiddleware,
      userChangePasswordValidation,
      this.changePassword
    );
  }

  private registration = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      const userRegistration = await UserService.registration(req.body);
      if (userRegistration.status === true) {
        await this.genericResponseMethod(userRegistration, req, res);
      } else {
        await this.genericErrorResponseMethod(
          userRegistration,
          200,
          "",
          req,
          res
        );
      }
    } catch (e) {
      this.sendServerError(res, e.message);
    }
  };

  private login = async (req: express.Request, res: express.Response) => {
    try {
      const userLoggedIn = await UserService.login(req.body);
      if (userLoggedIn.status === true) {
        //#region Generate auth token
        const jwtExpiresIn = process.env.JWT_EXPIRES; // 1 DAY
        const secret = process.env.JWT_SECRET;

        const userDetail = userLoggedIn.data as User;

        const tokenObj = {
          SK: userDetail.SK,
          PK: userDetail.PK,
        };
        const generateToken = jwt.sign(tokenObj, secret, {
          expiresIn: jwtExpiresIn,
        });

        //#endregion

        const resObj: IResponse = {
          res: res,
          status: 200,
          success: true,
          message: userLoggedIn.message,
          data: {
            userData: userLoggedIn.data,
            authToken: generateToken,
          },
        };
        this.send(resObj);
      } else {
        await this.genericErrorResponseMethod(userLoggedIn, 200, "", req, res);
      }
    } catch (error) {
      this.sendServerError(res, error.message);
    }
  };

  private addUsers = async (req: express.Request, res: express.Response) => {
    try {
      const addUser = await UserService.createUsers(req.body);
      if (addUser.status === true) {
        await this.genericResponseMethod(addUser, req, res);
      } else {
        await this.genericErrorResponseMethod(addUser, 200, "", req, res);
      }
    } catch (e) {
      this.sendServerError(res, e.message);
    }
  };

  private getAllUsers = async (req: express.Request, res: express.Response) => {
    try {
      const getAllUsers = await UserService.getAllUsers(req.body);
      await this.genericResponseMethod(getAllUsers, req, res);
    } catch (e) {
      this.sendServerError(res, e.message);
    }
  };

  private updateUser = async (req: express.Request, res: express.Response) => {
    try {
      const saveQueryParams = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        mobileNumber: req.body.mobileNumber,
        userRole: req.body.userRole,
        userStatus: req.body.status,
        updatedOn: new Date().toUTCString(),
      };
      const updateUser = await UserService.updateUser(
        req.body.emailId,
        saveQueryParams
      );

      if (updateUser.status === true) {
        await this.genericResponseMethod(updateUser, req, res);
      }
    } catch (e) {
      this.sendServerError(res, e.message);
    }
  };

  private deleteUser = async (req: express.Request, res: express.Response) => {
    try {
      const deleteUser = await UserService.deleteUser(req.params.userId);
      if (deleteUser.status === true) {
        await this.genericResponseMethod(deleteUser, req, res);
      }
    } catch (e) {
      this.sendServerError(res, e.message);
    }
  };

  private activateOrDeactivateUser = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      const saveQueryParams = {
        userStatus: req.body.status,
      };
      const result = await UserService.activateOrDeactivateUser(
        req.body.emailId,
        saveQueryParams
      );

      if (result.status === true) {
        await this.genericResponseMethod(result, req, res);
      } else {
        await this.genericErrorResponseMethod(
          "",
          200,
          message.error.USER_NOT_FOUND,
          req,
          res
        );
      }
    } catch (e) {
      this.sendServerError(res, e.message);
    }
  };

  private forgotPassword = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      const emailId = req.body.emailId;
      const userIsExist = await UserService.fetchUserByEmailOrUserId(emailId);

      if (userIsExist) {
        //#region sent email for forgot password link
        await UserService.forgotPasswordMailSent(emailId);
        //#endregion
        res.send({
          status: 200,
          success: true,
          message: message.success.FORGOT_PASSWORD_LINK_SENT,
          payload: true,
        });
      } else {
        await this.genericErrorResponseMethod(
          "",
          200,
          message.error.USER_NOT_FOUND,
          req,
          res
        );
      }
    } catch (error) {
      this.sendServerError(res, error.message);
    }
  };

  private forgotPasswordUpdate = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      const updateQueryParams = {
        emailId: req.body.emailId,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        updatedOn: new Date().toUTCString(),
      };
      const updateResp = await UserService.forgotPasswordUpdate(
        updateQueryParams
      );
      await this.genericResponseMethod(updateResp, req, res);
    } catch (error) {
      this.sendServerError(res, error.message);
    }
  };

  private emailVerificationForRegistration = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      const userId = req.params.userId;
      const userIsExist = await UserService.fetchUserByEmailOrUserId(userId);
      if (userIsExist) {
        //#region update user detail for verified email
        const updatedObj = {
          userId: req.params.userId,
          emailVerified: true,
          updatedOn: new Date().toUTCString(),
        };
        const updateUserData = await UserService.updateEmailVerifiedField(
          updatedObj
        );
        //#endregion
        if (updateUserData) {
          /**Sent welcome mail */
          await UserService.welcomeEmailSent(userId);
          res.send("Thank You! email verified successfully.");
        }
      }
    } catch (error) {
      this.sendServerError(res, error.message);
    }
  };

  private changePassword = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      const updateChangePasswordParams = {
        emailId: req.body.emailId,
        oldPassword: req.body.oldPassword,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        updatedOn: new Date().toUTCString(),
      };
      const changePasswordResp = await UserService.changePassword(
        updateChangePasswordParams
      );

      if (changePasswordResp.status === false) {
        await this.genericErrorResponseMethod(
          changePasswordResp.data,
          200,
          changePasswordResp.message,
          req,
          res
        );
      } else {
        await this.genericResponseMethod(changePasswordResp, req, res);
      }
    } catch (error) {
      this.sendServerError(res, error.message);
    }
  };

  private genericResponseMethod = async (
    obj,
    req: express.Request,
    res: express.Response
  ) => {
    const resObj: IResponse = {
      res: res,
      status: 200,
      success: true,
      message: obj.message,
      data: obj.data,
    };
    this.send(resObj);
  };

  private genericErrorResponseMethod = async (
    obj,
    statusCode,
    errorMessage,
    req: express.Request,
    res: express.Response
  ) => {
    return res.status(statusCode).send({
      status: statusCode,
      success: false,
      message: errorMessage != "" ? errorMessage : obj.message,
      payload: {},
    });
  };
}

export default UserController;
