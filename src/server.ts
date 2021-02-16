import App from './app';
import UserController from "./users/user.controller"

const app = new App(
  [
    new UserController()
  ],
  process.env.PORT,
);
 
app.listen();
export default app;