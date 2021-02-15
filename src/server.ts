import App from './app';
import RestaurantController from './restaurants/restaurant.controller';
import UserController from "./users/user.controller"

const app = new App(
  [
    new RestaurantController(),
    new UserController()
  ],
  process.env.PORT,
);
 
app.listen();
export default app;