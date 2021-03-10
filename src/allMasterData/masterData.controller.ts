import * as express from "express";
import * as MasterDataService from "./masterData.service";
import RequestBase from "../response/response.controller";
import { IResponse } from "../interfaces/response.interface";
import authMiddleware from "../middleware/auth.middleware";

class MasterDataController extends RequestBase {
  public path = "/api/masterData";
  public router = express.Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}/get-initial-config`,
      authMiddleware,
      this.allMasterDataSet
    );
  }

  private allMasterDataSet = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      //#region all role data set
      const fetchAllRoles = await MasterDataService.allRoleLists();
      //#endregion

      //#region fetch all permission data
      const fetchAllPermissionMaster = await MasterDataService.allPermissionLists();
      //#endregion

      const resObj: IResponse = {
        res: res,
        status: 200,
        success: true,
        message: fetchAllRoles.message,
        data: {
          roleLists: fetchAllRoles.data,
          permissionLists: fetchAllPermissionMaster.data,
        },
      };
      this.send(resObj);
    } catch (error) {
      this.sendServerError(res, error.message);
    }
  };
}

export default MasterDataController;
