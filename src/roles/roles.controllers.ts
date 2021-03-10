import * as express from "express";
import uuidValidate from "uuid-validate";
import * as RoleService from "./roles.service";

import RequestBase from "../response/response.controller";
import { IResponse } from "../interfaces/response.interface";
import { message } from "../constants/message.constant";
import authMiddleware from "../middleware/auth.middleware";
import {
  addRoleValidation,
  editRoleValidation,
  assignRoleValidation,
} from "../middleware/validator/roleValidation.middleware";

class RoleController extends RequestBase {
  public path = "/api/role";
  public router = express.Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/create`,
      authMiddleware,
      addRoleValidation,
      this.roleAdd
    );
    this.router.put(
      `${this.path}/update`,
      authMiddleware,
      editRoleValidation,
      this.roleEdit
    );
    this.router.delete(
      `${this.path}/delete/:roleId`,
      authMiddleware,
      this.roleDelete
    );
    this.router.get(`${this.path}/lists`, authMiddleware, this.roleList);

    this.router.put(
      `${this.path}/assign-role`,
      authMiddleware,
      assignRoleValidation,
      this.assignRoleToUser
    );
  }

  private roleAdd = async (req: express.Request, res: express.Response) => {
    try {
      const requestObj = req.body;
      const addRoleResp = await RoleService.addRole(requestObj);
      if (addRoleResp.status === false) {
        await this.genericErrorResponseMethod(addRoleResp, 409, "", req, res);
      }
      await this.genericResponseMethod(addRoleResp, req, res);
    } catch (error) {
      this.sendBadRequest(res, error.message);
    }
  };

  private roleEdit = async (req: express.Request, res: express.Response) => {
    try {
      const requestObj = req.body;
      const editRoleResp = await RoleService.updateRole(requestObj);
      if (editRoleResp.status === false) {
        await this.genericErrorResponseMethod(editRoleResp, 409, "", req, res);
      } else {
        await this.genericResponseMethod(editRoleResp, req, res);
      }
    } catch (error) {
      this.sendBadRequest(res, error.message);
    }
  };

  private roleDelete = async (req: express.Request, res: express.Response) => {
    try {
      const roleId = req.params.roleId;
      /**validate uuid-v4 type*/
      if (!uuidValidate(roleId)) {
        await this.genericErrorResponseMethod(
          "",
          400,
          message.error.INVALID_UUID,
          req,
          res
        );
      }
      const deleteRoleResp = await RoleService.deleteRole(roleId);
      await this.genericResponseMethod(deleteRoleResp, req, res);
    } catch (error) {
      this.sendBadRequest(res, error.message);
    }
  };

  private roleList = async (req: express.Request, res: express.Response) => {
    try {
      const fetchAllRoleList = await RoleService.listRole();
      await this.genericResponseMethod(fetchAllRoleList, req, res);
    } catch (error) {
      this.sendBadRequest(res, error.message);
    }
  };

  private assignRoleToUser = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      const updateUserRole = await RoleService.assignRoleToUser(req.body);
      if (updateUserRole.status === true) {
        await this.genericResponseMethod(updateUserRole, req, res);
      }
    } catch (error) {
      this.sendBadRequest(res, error.message);
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

export default RoleController;
