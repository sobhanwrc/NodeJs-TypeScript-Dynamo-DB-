import express from 'express';
import helmet from 'helmet'
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
    this.initializeSecurities();
    this.defaultMethods();
    this.logger = createLogFile();
  }

  private initializeSecurities() {
    this.app.use(helmet());
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

  private defaultMethods() {
    this.app.use((req: express.Request, res: express.Response) => {
      res.status(405).send({
        error : {
          message : "Method not found"
        }
      })
    })
  }
  
  public listen() {
    this.app.listen(this.port, () => {
      this.logger.info(`App listening on the port ${this.port}`);
    });
  }
}

export default App;
