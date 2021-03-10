import * as express from "express";
import * as PermissionService from "./permission.service";
import uuidValidate from "uuid-validate";
import RequestBase from "../response/response.controller";
import { IResponse } from "../interfaces/response.interface";
import authMiddleware from "../middleware/auth.middleware";
import {
  addPermissionValidation,
  editPermissionValidation,
} from "../middleware/validator/permissionValidation.middleware";
import { message } from "../constants/message.constant";

class PermissionController extends RequestBase {
  public path = "/api/permission";
  public router = express.Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/add`,
      authMiddleware,
      addPermissionValidation,
      this.addPermission
    );
    this.router.post(
      `${this.path}/edit`,
      authMiddleware,
      editPermissionValidation,
      this.editPermission
    );

    this.router.get(
      `${this.path}/role-permission-mapping-lists/:roleId`,
      authMiddleware,
      this.listsPermission
    );

    this.router.delete(
      `${this.path}/delete/:rolePermissionId`,
      authMiddleware,
      this.deletePermission
    );
  }

  private addPermission = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      const permissionObj = req.body;
      const addResp = await PermissionService.createPermission(permissionObj);
      if (addResp.status === true) {
        await this.genericResponseMethod(addResp, req, res);
      } else {
        await this.genericErrorResponseMethod(addResp, 409, "", req, res);
      }
    } catch (error) {
      this.sendServerError(res, error.message);
    }
  };

  private editPermission = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      const roleId = req.body.rolePermissionId;
      if (!uuidValidate(roleId)) {
        await this.genericErrorResponseMethod(
          "",
          400,
          message.error.INVALID_UUID,
          req,
          res
        );
      } else {
        const permissionUpdateObj = req.body;
        const addResp = await PermissionService.updatePermission(
          roleId,
          permissionUpdateObj
        );
        if (addResp.status === true) {
          await this.genericResponseMethod(addResp, req, res);
        } else {
          await this.genericErrorResponseMethod(addResp, 200, "", req, res);
        }
      }
    } catch (error) {
      this.sendServerError(res, error.message);
    }
  };

  private listsPermission = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      const roleId = req.params.roleId;
      const fetchAllPermissionMappingList = await PermissionService.lists(
        roleId
      );
      await this.genericResponseMethod(fetchAllPermissionMappingList, req, res);
    } catch (error) {
      this.sendServerError(res, error.message);
    }
  };

  private deletePermission = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      const deletePermissionMappingList = await PermissionService.deletePermission(
        req.params.rolePermissionId
      );
      if (deletePermissionMappingList.status === true) {
        await this.genericResponseMethod(deletePermissionMappingList, req, res);
      } else {
        await this.genericErrorResponseMethod(
          deletePermissionMappingList,
          200,
          "",
          req,
          res
        );
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

export default PermissionController;
