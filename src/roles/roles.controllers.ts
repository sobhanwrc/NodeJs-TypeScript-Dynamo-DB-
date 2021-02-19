import * as express from 'express';
import uuidValidate from 'uuid-validate';
import * as RoleService from './roles.service';

import RequestBase from '../response/response.controller';
import { IResponse } from '../interfaces/response.interface';
import { message } from '../constants/message.constant';
import authMiddleware from '../middleware/auth.middleware';
import {addRoleValidation, editRoleValidation} from "../middleware/validator/roleValidation.middleware";

class RoleController extends RequestBase {
    public path = '/api/role';
    public router = express.Router();
  
    constructor() {
      super();
      this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}/create`, authMiddleware, addRoleValidation, this.roleAdd)
        this.router.put(`${this.path}/update`, authMiddleware, editRoleValidation, this.roleEdit)
        this.router.delete(`${this.path}/delete/:roleId`, authMiddleware, this.roleDelete)
        this.router.get(`${this.path}/lists`, authMiddleware, this.roleList)
    }

    private roleAdd = async (req: express.Request, res: express.Response) => {
        try {
            const requestObj = req.body
            const addRoleResp = await RoleService.addRole(requestObj);
            if(addRoleResp.status === false){
                return res.status(409).send({
                    "status": 409,
                    "message": addRoleResp.message,
                    "payload" : {}
                })
            }
            const resObj: IResponse = {
                res: res,
                status: 200,
                message: addRoleResp.message,
                data: addRoleResp.data
              }
            this.send(resObj);
        } catch (error) {
            this.sendBadRequest(res, error.message)
        }
    }

    private roleEdit = async (req: express.Request, res: express.Response) => {
        try {
            const requestObj = req.body
            const editRoleResp = await RoleService.updateRole(requestObj);
            if(editRoleResp.status === false){
                return res.status(409).send({
                    "status": 409,
                    "message": editRoleResp.message,
                    "payload" : {}
                })
            }
            const resObj: IResponse = {
                res: res,
                status: 200,
                message: editRoleResp.message,
                data: editRoleResp.data
              }
            this.send(resObj);
        } catch (error) {
            this.sendBadRequest(res, error.message)
        }
    }

    private roleDelete = async (req: express.Request, res: express.Response) => {
        try {
            const roleId = req.params.roleId
            /**validate uuid-v4 type*/
            if(!uuidValidate(roleId)){
                return res.status(400).send({
                    message : message.error.INVALID_UUID,
                    data :{}
                })
            }
            const deleteRoleResp = await RoleService.deleteRole(roleId)
            const resObj: IResponse = {
                res: res,
                status: 200,
                message: deleteRoleResp.message,
                data: deleteRoleResp.data
            }
            this.send(resObj);

        } catch (error) {
            this.sendBadRequest(res, error.message)
        }
    }

    private roleList = async (req: express.Request, res: express.Response) => {
        try {
            const fetchAllRoleList = await RoleService.listRole();
            const resObj: IResponse = {
                res: res,
                status: 200,
                message: fetchAllRoleList.message,
                data: fetchAllRoleList.data
            }
            this.send(resObj);
        } catch (error) {
            this.sendBadRequest(res, error.message)
        }
    }
}

export default RoleController;