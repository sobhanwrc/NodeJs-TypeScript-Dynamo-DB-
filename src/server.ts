import App from "./app";
import UserController from "./users/user.controller";
import RoleController from "./roles/roles.controllers";
import MasterDataController from "./allMasterData/masterData.controller";
import BumperController from "./bumpers/bumpers.controller";
import PermissionController from "./permission/permission.controller";

const app = new App(
  [
    new UserController(),
    new RoleController(),
    new MasterDataController(),
    new PermissionController(),
    new BumperController(),
  ],
  process.env.PORT
);

app.listen();
export default app;
