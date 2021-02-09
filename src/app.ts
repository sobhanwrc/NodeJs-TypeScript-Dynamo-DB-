import express from 'express';
import * as bodyParser from 'body-parser';
import cors from 'cors';
import 'dotenv/config';

import connectToTheDatabase from './dbConnection';
import { createLogFile } from './utils/logger';

class App {
  public app: express.Application;
  public port: number;
  public logger;
  
  constructor(controllers, port) {
    this.app = express();
    this.port = Number(port);

    connectToTheDatabase();
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.logger = createLogFile();
  }

  private initializeMiddlewares() {
    this.app.use(cors());
    this.app.use(bodyParser.json());
    this.app.use('/', express.static('public'));
  }

  private initializeControllers(controllers) {
    controllers.forEach((controller) => {
      this.app.use('/', controller.router);
    });
  }
  
  public listen() {
    this.app.listen(this.port, () => {
      this.logger.info(`App listening on the port ${this.port}`);
    });
  }
}

export default App;
