import { NextFunction, Response} from 'express';
import * as jwt from 'jsonwebtoken';
import DataStoredInToken from '../interfaces/dataStoredInToken';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import AWS from 'aws-sdk';
import { message } from '../constants/message.constant';

const awsConfig = {
    "region" : process.env.aws_region,
    "endpoint" : process.env.aws_endpoint,
    "accessKeyId" : process.env.aws_accessKeyId,
    "secretAccessKey" : process.env.aws_secretAccessKey
};
AWS.config.update(awsConfig);

const docClient = new AWS.DynamoDB.DocumentClient();
 
async function authMiddleware(request: RequestWithUser, response: Response, next: NextFunction) {
  const token = request.header('Authorization')
    if(token){
    const secret = process.env.JWT_SECRET;
    try {
      const verificationResponse = jwt.verify(token, secret) as DataStoredInToken;
      const userId = verificationResponse.SK;

      const params = {
          TableName: process.env.aws_TableName,
          Key:{
              "PK" : "USR",
              "SK" : userId
          }
       }

      const userDetail = await docClient.get(params).promise();

      const obj = {
        PK : userDetail.Item.PK,
        SK : userDetail.Item.SK,
        firstName : userDetail.Item.firstName,
        lastName : userDetail.Item.lastName,
      }
      if (userDetail) {
        request.user = obj;

        next();
      } else {
        return response.status(403).send({
          error : {
            message : message.error.WRONG_TOKEN_SUPPLIED
          }
        })
      }
    } catch (error) {
      return response.status(401).send({
        error : {
          message : error.message
        }
      })
    }
  } else {

    return response.status(401).send({
      error : {
        message : message.error.TOKEN_NOT_SUPPLIED
      }
    })
  }
}
 
export default authMiddleware;