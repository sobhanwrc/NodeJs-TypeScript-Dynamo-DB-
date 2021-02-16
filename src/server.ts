import App from './app';
import NodemailController from '../src/nodemailer.controller';
import UserController from "./users/user.controller"

const app = new App(
  [
    new NodemailController(),
    new UserController()
  ],
  process.env.PORT,
);
 
app.listen();
export default app;