import App from './app';
import UserController from "./users/user.controller"
import RoleController from "./roles/roles.controllers"

import cron from 'node-cron'

const app = new App(
  [
    new UserController(),
    new RoleController()
  ],
  process.env.PORT,
);
 
cron.schedule('*/1 * * * *', () => {
  console.log('running a task every minute');
  
});

app.listen();
export default app;