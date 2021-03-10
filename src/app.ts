/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import express from "express";
import helmet from "helmet";
import * as bodyParser from "body-parser";
import cors from "cors";
import "dotenv/config";

import { createLogFile } from "./utils/logger";

class App {
  public app: express.Application;
  public port: number;
  public logger;

  constructor(controllers, port: string) {
    this.app = express();
    this.port = Number(port);

    this.initializeMiddleware();
    this.initializeControllers(controllers);
    this.initializeSecurities();
    this.defaultMethods();
    this.logger = createLogFile();
  }

  private initializeSecurities() {
    this.app.use(helmet());
  }

  private initializeMiddleware() {
    this.app.use(cors());
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use("/", express.static("public"));
  }

  private initializeControllers(controllers) {
    controllers.forEach((controller) => {
      this.app.use("/", controller.router);
    });
  }

  private defaultMethods() {
    this.app.use((req: express.Request, res: express.Response) => {
      res.status(405).send({
        error: {
          message: "Method not found",
        },
      });
    });
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      this.logger.info(`App listening on the port ${this.port}`);
      console.log("Test Precommit  Hooks");
    });
  }
}

export default App;
