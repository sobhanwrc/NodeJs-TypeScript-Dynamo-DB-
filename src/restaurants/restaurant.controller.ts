import * as express from 'express';
import * as RestaurantService from './restaurant.service';

import RequestBase from '../response/response.controller';
import { IResponse } from '../interfaces/response.interface';
import { message } from '../constants/message.constant';
import authMiddleware from '../middleware/auth.middleware'

class RestaurantController extends RequestBase {
  public path = '/api/restaurant';
  public router = express.Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}`, authMiddleware, this.addRestaurant);
    this.router.get(`${this.path}`, authMiddleware, this.getAllRestaurants);
    this.router.get(`${this.path}/:id`, this.getRestaurant);
    this.router.put(`${this.path}/:id`, this.updateRestaurant);
    this.router.delete(`${this.path}/:id`, this.deleteRestaurant);
  }

  private addRestaurant = async (req: express.Request, res: express.Response) => {
    try {
      if (!req.body.name) {
        return this.sendBadRequest(res, message.error.RES_NAME_REQ);
      }
      const saveQueryParams = {
        name: req.body.name,
        description: req.body.description || '',
        restroCode: req.body.restroCode
      };
      const result = await RestaurantService.createRestaurants(saveQueryParams);
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

  private getRestaurant = async (req: express.Request, res: express.Response) => {
    try {
      const restaurant = await RestaurantService.getRestaurant(req.params.id);

      const resObj: IResponse = {
        res: res,
        status: 200,
        message: message.success.USR_GET,
        data: restaurant
      }
      this.send(resObj);
    } catch (e) {
      this.sendServerError(res, e.message);
    }
  }

  private getAllRestaurants = async (req: express.Request, res: express.Response) => {
    try {
      let restaurants: any;

      if (req.query.keyword) {
        restaurants = await RestaurantService.searchRestaurants(req.query.keyword)
      } else {
        restaurants = await RestaurantService.getAllRestaurants();
      }

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

  private updateRestaurant = async (req: express.Request, res: express.Response) => {
    try {
      const saveQueryParams = {
        name: req.body.name,
        description: req.body.description,
        status: req.body.status
      };
      const result = await RestaurantService.updateRestaurants(req.params.id, saveQueryParams);

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

  private deleteRestaurant = async (req: express.Request, res: express.Response) => {
    try {
      const restaurant = await RestaurantService.deleteRestaurant(req.params.id);

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