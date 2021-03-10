/* eslint-disable @typescript-eslint/no-explicit-any */
import * as express from "express";
import * as BumperService from "./bumpers.service";

import RequestBase from "../response/response.controller";
import { IResponse } from "../interfaces/response.interface";
import authMiddleware from "../middleware/auth.middleware";
import {
  addBumpersValidation,
  deleteBumpersValidation,
} from "../middleware/validator/bumperValidation.middleware";
import multer from "multer";
import multerS3 from "multer-s3";
import AWS from "aws-sdk";

const awsConfig = {
  region: process.env.aws_region,
  accessKeyId: process.env.aws_accessKeyId,
  secretAccessKey: process.env.aws_secretAccessKey,
};
AWS.config.update(awsConfig);

const s3 = new AWS.S3();

//#region Video & Thumbnail upload into AWS S3
const storage = multerS3({
  s3: s3,
  bucket: `${process.env.aws_S3_BUCKET}`,
  acl: "public-read",
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  key: function (req, files, cb) {
    if (req.files.video && req.files.video.length > 0) {
      cb(null, Date.now().toString() + ".mp4");
    }

    if (req.files.thumbnail && req.files.thumbnail.length > 0) {
      const ext = files.mimetype.split("/")[1];
      cb(null, Date.now().toString() + "." + ext);
    }
  },
});

const upload = multer({ storage: storage, limits: { fileSize: 1000000 } });
//#endregion

class BumperController extends RequestBase {
  public path = "/api/bumpers";
  public router = express.Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}/fetch-advertisement-mapping-record/:advId`,
      authMiddleware,
      this.fetchDependencyDataOfAdvertiser
    );

    this.router.post(
      `${this.path}/add`,
      authMiddleware,
      upload.fields([
        {
          name: "video",
          maxCount: 1,
        },
        {
          name: "thumbnail",
          maxCount: 1,
        },
      ]),
      addBumpersValidation,
      this.addBumper
    );

    this.router.get(`${this.path}/view`, authMiddleware, this.listBumpers);

    this.router.delete(
      `${this.path}/bulk-delete`,
      authMiddleware,
      deleteBumpersValidation,
      this.deleteBumpers
    );
  }

  private fetchDependencyDataOfAdvertiser = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      const advId = req.params.advId;
      const detail = await BumperService.fetchDependencyDataOfAdvertiser(advId);
      await this.genericResponseMethod(detail, req, res);
    } catch (error) {
      this.sendBadRequest(res, error.message);
    }
  };

  private addBumper = async (req: express.Request, res: express.Response) => {
    const fileUploadObj = JSON.parse(JSON.stringify(req.files));
    let videoLink = "",
      thumbnailLink = "",
      videoFileName = "",
      thumbnailName = "";
    if (fileUploadObj.video && fileUploadObj.video.length > 0) {
      const videoObj = fileUploadObj.video[0];
      videoLink = videoObj.location;
      videoFileName = videoLink.split("/")[3];
    }

    if (fileUploadObj.thumbnail && fileUploadObj.thumbnail.length > 0) {
      const thumbnailObj = fileUploadObj.thumbnail[0];
      thumbnailLink = thumbnailObj.location;
      thumbnailName = thumbnailLink.split("/")[3];
    }
    try {
      if (req.files) {
        const bumperObj = {
          ...req.body,
          video: videoLink,
          thumbnail: thumbnailLink ? thumbnailLink : "",
        };
        const detail = await BumperService.addBumper(bumperObj);

        if (detail.status === true) {
          await this.genericResponseMethod(detail, req, res);
        } else {
          //#region delete video & thumbnail from s3
          await this.deleteS3Object(videoFileName);
          await this.deleteS3Object(thumbnailName);
          //#endregion

          await this.genericErrorResponseMethod(detail, 409, "", req, res);
        }
      }
    } catch (error) {
      //#region delete video & thumbnail from s3
      await this.deleteS3Object(videoFileName);
      await this.deleteS3Object(thumbnailName);
      //#endregion
      this.sendBadRequest(res, error.message);
    }
  };

  private listBumpers = async (req: express.Request, res: express.Response) => {
    try {
      const fetchAllBumpers = await BumperService.listBumpers();
      await this.genericResponseMethod(fetchAllBumpers, req, res);
    } catch (error) {
      this.sendBadRequest(res, error.message);
    }
  };

  private deleteBumpers = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      const fetchAllBumpers = await BumperService.deleteBumpers(
        req.body.bumperIds
      );
      await this.genericResponseMethod(fetchAllBumpers, req, res);
    } catch (error) {
      this.sendBadRequest(res, error.message);
    }
  };

  private genericResponseMethod = async (
    obj,
    req: express.Request,
    res: express.Response
  ) => {
    const resObj: IResponse = {
      res: res,
      status: 200,
      success: true,
      message: obj.message,
      data: obj.data,
    };
    this.send(resObj);
  };

  private genericErrorResponseMethod = async (
    obj,
    statusCode,
    errorMessage,
    req: express.Request,
    res: express.Response
  ) => {
    return res.status(statusCode).send({
      status: statusCode,
      success: false,
      message: errorMessage != "" ? errorMessage : obj.message,
      payload: {},
    });
  };

  private deleteS3Object = async (fileName) => {
    const deleteParam = {
      Bucket: `${process.env.aws_S3_BUCKET}`,
      Key: fileName,
    };
    const deleteResp = await s3.deleteObject(deleteParam).promise();
    return deleteResp;
  };
}

export default BumperController;
