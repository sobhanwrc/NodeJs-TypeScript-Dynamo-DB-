import AWS from "aws-sdk";
import { QueryOutput } from "aws-sdk/clients/dynamodb";
import { message } from "../constants/message.constant";

import { IRoleSuccessResponse } from "../roles/role.interface";
import { IPermissionSuccessResponse } from "./masterData.interface";

const awsConfig = {
  region: process.env.aws_region,
  accessKeyId: process.env.aws_accessKeyId,
  secretAccessKey: process.env.aws_secretAccessKey,
};
AWS.config.update(awsConfig);

const docClient = new AWS.DynamoDB.DocumentClient();

export async function allRoleLists(): Promise<IRoleSuccessResponse> {
  const fetchAllRolesParam = {
    TableName: process.env.aws_TableName,
    KeyConditionExpression: "#partitionKey = :PK",
    ExpressionAttributeNames: {
      "#partitionKey": "PK",
    },
    ExpressionAttributeValues: {
      ":PK": "ROLE",
    },
  };
  const allRoles: QueryOutput = await docClient
    .query(fetchAllRolesParam)
    .promise();
  return {
    status: true,
    message: message.success.ROLE_LIST,
    data: allRoles,
  } as IRoleSuccessResponse;
}

export async function allPermissionLists(): Promise<IPermissionSuccessResponse> {
  const fetchAllPermission = {
    TableName: process.env.aws_TableName,
    KeyConditionExpression: "#partitionKey = :PK",
    ExpressionAttributeNames: {
      "#partitionKey": "PK",
    },
    ExpressionAttributeValues: {
      ":PK": "PERMISSION",
    },
  };
  const allPermission: QueryOutput = await docClient
    .query(fetchAllPermission)
    .promise();
  return {
    status: true,
    message: message.success.ROLE_LIST,
    data: allPermission,
  } as IPermissionSuccessResponse;
}
