import App from './app';
import RestaurantController from './restaurants/restaurant.controller';
import AuthenticationController from './authentication/authentication.controller';

const app = new App(
  [
    new RestaurantController(),
    new AuthenticationController(),
  ],
  process.env.PORT,
);
 
app.listen();
export default app;