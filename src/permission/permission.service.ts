import AWS from "aws-sdk";
import postLogDetail from "../auditLogs/addLogs";
import { QueryOutput, GetItemOutput } from "aws-sdk/clients/dynamodb";
import { message } from "../constants/message.constant";
import { UUID } from "aws-sdk/clients/inspector";

import {
  PermissionMapping,
  IPermissionMappingErrorResponse,
  IPermissionMappingSuccessResponse,
} from "./permission.interface";

const awsConfig = {
  region: process.env.aws_region,
  accessKeyId: process.env.aws_accessKeyId,
  secretAccessKey: process.env.aws_secretAccessKey,
};
AWS.config.update(awsConfig);

const docClient = new AWS.DynamoDB.DocumentClient();

export async function createPermission(
  permissionObj: PermissionMapping
): Promise<
  IPermissionMappingSuccessResponse | IPermissionMappingErrorResponse
> {
  //#region checking role is already mapping with permission or not.
  const isExist = await roleExistInPermission(permissionObj.roleId);
  //#endregion

  if (isExist.status === false) {
    //#region add mapping with role
    const SK = permissionObj.roleId;
    delete permissionObj.roleId;

    const addObj: PermissionMapping = {
      PK: "ROLE_PERMISSION",
      SK: SK,
      ...permissionObj,
      createdOn: new Date().toUTCString(),
      updatedOn: new Date().toUTCString(),
    };

    const roleWithPermissionMappingObj = {
      TableName: process.env.aws_TableName,
      Item: addObj,
    };
    await docClient.put(roleWithPermissionMappingObj).promise();
    //#endregion

    //#region for audit logs
    const oldValueForLog = {};
    const newValueForLog = addObj;
    await auditLog(
      addObj.SK,
      "ROLE_PERMISSION",
      "Add",
      oldValueForLog,
      newValueForLog,
      new Date().toUTCString(),
      new Date().toUTCString()
    );
    //#endregion

    return {
      status: true,
      message: message.success.ROLE_PERMISSION_MAPPING_ADD,
      data: {},
    } as IPermissionMappingSuccessResponse;
  } else {
    return {
      status: false,
      message: message.error.ROLE_PERMISSION_MAPPING_IS_EXIST,
      data: {},
    } as IPermissionMappingErrorResponse;
  }
}

export async function updatePermission(
  roleId: UUID,
  permissionObj: PermissionMapping
): Promise<
  IPermissionMappingSuccessResponse | IPermissionMappingErrorResponse
> {
  //#region checking role is already mapping with permission or not.
  const isExist = await roleExistInPermission(roleId);
  //#endregion

  if (isExist.status === false) {
    return isExist as IPermissionMappingErrorResponse;
  } else {
    //#region delete existing one and then insert updated result
    const deleteParams = {
      TableName: process.env.aws_TableName,
      Key: {
        PK: "ROLE_PERMISSION",
        SK: roleId,
      },
    };
    await docClient.delete(deleteParams).promise();
    //#endregion

    //#region add mapping with role
    const SK = permissionObj.roleId;
    delete permissionObj.roleId;

    const addObj: PermissionMapping = {
      PK: "ROLE_PERMISSION",
      SK: SK,
      ...permissionObj,
      createdOn: new Date().toUTCString(),
      updatedOn: new Date().toUTCString(),
    };

    const roleWithPermissionMappingObj = {
      TableName: process.env.aws_TableName,
      Item: addObj,
    };
    await docClient.put(roleWithPermissionMappingObj).promise();
    //#endregion

    //#region for audit logs
    const oldValueForLog = isExist.data;
    const newValueForLog = addObj;
    await auditLog(
      addObj.SK,
      "ROLE_PERMISSION",
      "Update",
      oldValueForLog,
      newValueForLog,
      new Date().toUTCString(),
      new Date().toUTCString()
    );
    //#endregion

    return {
      status: true,
      message: message.success.ROLE_PERMISSION_MAPPING_UPDATE,
      data: {},
    } as IPermissionMappingSuccessResponse;
  }
}

export async function lists(
  roleId: string
): Promise<IPermissionMappingSuccessResponse> {
  let fetchAllRolesPermissionParam;
  let allMappingData;
  if (roleId === "All") {
    fetchAllRolesPermissionParam = {
      TableName: process.env.aws_TableName,
      KeyConditionExpression: "#partitionKey = :PK",
      ExpressionAttributeNames: {
        "#partitionKey": "PK",
      },
      ExpressionAttributeValues: {
        ":PK": "ROLE_PERMISSION",
      },
    };
    allMappingData = await docClient
      .query(fetchAllRolesPermissionParam)
      .promise();
  } else {
    fetchAllRolesPermissionParam = {
      TableName: process.env.aws_TableName,
      Key: {
        PK: "ROLE_PERMISSION",
        SK: roleId,
      },
    };
    allMappingData = await docClient
      .get(fetchAllRolesPermissionParam)
      .promise();
  }

  return {
    status: true,
    message: message.success.ROLE_PERMISSION_MAPPING_LIST,
    data: allMappingData,
  } as IPermissionMappingSuccessResponse;
}

export async function deletePermission(
  roleId: UUID
): Promise<
  IPermissionMappingSuccessResponse | IPermissionMappingErrorResponse
> {
  const isExist = await roleExistInPermission(roleId);
  if (isExist.status === true) {
    const deleteParams = {
      TableName: process.env.aws_TableName,
      Key: {
        PK: "ROLE_PERMISSION",
        SK: roleId,
      },
    };
    await docClient.delete(deleteParams).promise();

    //#region for audit logs
    const oldData = isExist.data as PermissionMapping;
    const oldValueForLog = oldData;
    const newValueForLog = {};
    await auditLog(
      oldData.SK,
      "ROLE_PERMISSION",
      "Delete",
      oldValueForLog,
      newValueForLog,
      new Date().toUTCString(),
      new Date().toUTCString()
    );
    //#endregion

    return {
      status: true,
      message: message.success.ROLE_PERMISSION_MAPPING_DELETE,
      data: {},
    } as IPermissionMappingSuccessResponse;
  } else {
    return isExist as IPermissionMappingErrorResponse;
  }
}

async function roleExistInPermission(
  roleId: UUID
): Promise<
  IPermissionMappingSuccessResponse | IPermissionMappingErrorResponse
> {
  const roleCheckingParams = {
    TableName: process.env.aws_TableName,
    Key: {
      PK: "ROLE_PERMISSION",
      SK: roleId,
    },
  };
  const fetchDetail: GetItemOutput = await docClient
    .get(roleCheckingParams)
    .promise();

  if (Object.keys(fetchDetail).length > 0) {
    return {
      status: true,
      message: message.success.ROLE_PERMISSION_MAPPING_DETAIL,
      data: fetchDetail.Item,
    } as IPermissionMappingSuccessResponse;
  } else {
    return {
      status: false,
      message: message.error.ROLE_PERMISSION_ID_NOT_FOUND,
      data: {},
    } as IPermissionMappingErrorResponse;
  }
}

async function auditLog(
  roleId,
  entity,
  event,
  objOldData,
  objNewData,
  createdOn,
  updatedOn
) {
  const addLogDetailObj = {
    roleId: roleId,
    entity: entity,
    event: event,
    objOldData: objOldData,
    objNewData: objNewData,
    createdOn: createdOn,
    updatedOn: updatedOn,
  };
  await postLogDetail(addLogDetailObj);
}
