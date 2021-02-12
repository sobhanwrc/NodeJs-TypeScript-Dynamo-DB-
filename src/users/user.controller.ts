import * as express from 'express';
import * as UserService from './user.service';

import RequestBase from '../response/response.controller';
import { IResponse } from '../interfaces/response.interface';
import { message } from '../constants/message.constant';
import authMiddleware from '../middleware/auth.middleware'
import userAddValidation from "../middleware/validator/UserValidatation.middleware"

class RestaurantController extends RequestBase {
  public path = '/api';
  public router = express.Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/add-user`, userAddValidation, this.addUsers);
    this.router.get(`${this.path}/list-user`, this.getAllUsers);
    this.router.put(`${this.path}/update-user/:userId`, this.updateUser);
    this.router.delete(`${this.path}/delete-user/:userId`, this.deleteUser);
  }

  private addUsers = async (req: express.Request, res: express.Response) => {
    try {
      const result = await UserService.createUsers(req.body);
      const resObj: IResponse = {
        res: res,
        status: 201,
        message: message.success.USR_ADD,
        data: result
      }
      this.send(resObj);
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
        firstName: req.body.firstName
      };
      const result = await UserService.updateUser(req.params.userId, saveQueryParams);

      const resObj: IResponse = {
        res: res,
        status: 201,
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

}

export default RestaurantController;