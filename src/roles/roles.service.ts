import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { message } from "../constants/message.constant";
import postLogDetail from "../auditLogs/addLogs";

import {
  IRoleErrorResponse,
  Role,
  IRoleSuccessResponse,
  IAssignRole,
} from "./role.interface";
import { UUID } from "aws-sdk/clients/inspector";
import {
  DeleteItemOutput,
  QueryOutput,
  UpdateItemOutput,
} from "aws-sdk/clients/dynamodb";

const awsConfig = {
  region: process.env.aws_region,
  accessKeyId: process.env.aws_accessKeyId,
  secretAccessKey: process.env.aws_secretAccessKey,
};
AWS.config.update(awsConfig);

const docClient = new AWS.DynamoDB.DocumentClient();

export async function addRole(
  payload: Role
): Promise<IRoleErrorResponse | IRoleSuccessResponse> {
  //#region checking role is already exist or not
  const getRole = {
    TableName: process.env.aws_TableName,
    KeyConditionExpression: "#partitionKey = :PK",
    ExpressionAttributeNames: {
      "#partitionKey": "PK",
      "#roleType": "roleName",
    },
    ExpressionAttributeValues: {
      ":PK": "ROLE",
      ":roleType": payload.roleName.toLowerCase(),
    },
    FilterExpression: "#roleType = :roleType",
  };
  const fetchCustomerRoleDetail = await docClient.query(getRole).promise();

  if (fetchCustomerRoleDetail.Items.length > 0) {
    return {
      status: false,
      message: message.error.ROLE_EXIST,
      data: {},
    } as IRoleErrorResponse;
  }
  //#endregion

  //#region adding new role
  const addObj: Role = {
    PK: "ROLE",
    SK: uuidv4(),
    roleName: payload.roleName.toLowerCase(),
    description: payload.description,
    roleStatus: true,
    createdOn: new Date().toUTCString(),
    updatedOn: new Date().toUTCString(),
  };

  const params = {
    TableName: process.env.aws_TableName,
    Item: addObj,
  };

  await docClient.put(params).promise(); //for adding data to DB

  //#region for audit logs
  const oldValueForLog = {};
  const newValueForLog = addObj;
  await auditLog(
    addObj.SK,
    "ROLE",
    "Add",
    oldValueForLog,
    newValueForLog,
    new Date().toUTCString(),
    new Date().toUTCString()
  );
  //#endregion

  return {
    status: true,
    message: message.success.ROLE_ADD,
    data: {},
  } as IRoleSuccessResponse;
  //#endregion
}

export async function updateRole(
  payload: Role
): Promise<IRoleErrorResponse | IRoleSuccessResponse> {
  //#region fetch role by Id
  const roleDetails = await roleDetail(payload.roleId);
  if (roleDetails.status === false) {
    return roleDetails;
  }
  //#endregion

  //#region checking role is already exist or not
  const fetchRoleDetail = roleDetails.data as Role;
  const getRole = {
    TableName: process.env.aws_TableName,
    KeyConditionExpression: "#partitionKey = :PK",
    ExpressionAttributeNames: {
      "#partitionKey": "PK",
      "#roleType": "roleName",
    },
    ExpressionAttributeValues: {
      ":PK": "ROLE",
      ":roleType": payload.roleName.toLowerCase(),
      ":existingRole": fetchRoleDetail.roleName,
    },
    FilterExpression: "#roleType = :roleType AND #roleType <> :existingRole",
  };
  const fetchCustomerRoleDetail = await docClient.query(getRole).promise();
  if (fetchCustomerRoleDetail.Items.length > 0) {
    return {
      status: false,
      message: message.error.ROLE_EXIST,
      data: {},
    } as IRoleErrorResponse;
  }
  //#endregion

  //#region update role
  const updateObj: Role = {
    roleId: payload.roleId,
    roleName: payload.roleName.toLowerCase(),
    description: payload.description,
    roleStatus: payload.roleStatus,
    updatedOn: new Date().toUTCString(),
  };

  const params = {
    TableName: process.env.aws_TableName,
    Key: {
      PK: "ROLE",
      SK: updateObj.roleId,
    },
    UpdateExpression:
      "set roleName = :byName, description = :byDesc, roleStatus = :status, updatedOn = :byDate",
    ExpressionAttributeValues: {
      ":byName": updateObj.roleName,
      ":byDesc": updateObj.description,
      ":status": updateObj.roleStatus,
      ":byDate": updateObj.updatedOn,
    },
    ReturnValues: "UPDATED_NEW",
  };
  const addRoleResp: UpdateItemOutput = await docClient
    .update(params)
    .promise(); //for adding data to DB

  //#region for audit logs
  const oldValueForLog = roleDetails.data;
  const newValueForLog = updateObj;
  await auditLog(
    payload.roleId,
    "ROLE",
    "Edit",
    oldValueForLog,
    newValueForLog,
    new Date().toUTCString(),
    new Date().toUTCString()
  );
  //#endregion

  return {
    status: true,
    message: message.success.ROLE_UPDATE,
    data: addRoleResp,
  } as IRoleSuccessResponse;
  //#endregion
}

export async function deleteRole(
  roleId: UUID
): Promise<IRoleErrorResponse | IRoleSuccessResponse> {
  //#region fetch role detail
  const roleDetails = await roleDetail(roleId);
  if (roleDetails.status === false) {
    return roleDetails;
  }
  //#endregion

  //#region delete role
  const deleteRoleParams = {
    TableName: process.env.aws_TableName,
    Key: {
      PK: "ROLE",
      SK: roleId,
    },
  };
  const deleteRoleResp: DeleteItemOutput = await docClient
    .delete(deleteRoleParams)
    .promise();
  //#endregion

  //#region for audit logs
  const oldValueForLog = roleDetails.data;
  const newValueForLog = {};
  await auditLog(
    roleId,
    "ROLE",
    "Delete",
    oldValueForLog,
    newValueForLog,
    new Date().toUTCString(),
    new Date().toUTCString()
  );
  //#endregion

  return {
    status: true,
    message: message.success.ROLE_DELETE,
    data: deleteRoleResp,
  } as IRoleSuccessResponse;
}

export async function listRole(): Promise<
  IRoleErrorResponse | IRoleSuccessResponse
> {
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

export async function assignRoleToUser(
  payload: IAssignRole
): Promise<IRoleErrorResponse | IRoleSuccessResponse> {
  const roleId = payload.roleId;
  const updatedUserIds = payload.userIds;
  let numberOfUpdatedUser = 0;
  for (const userDetail of updatedUserIds) {
    const userId = userDetail.SK;

    const param = {
      TableName: process.env.aws_TableName,
      Key: {
        PK: "USR",
        SK: userId,
      },
      UpdateExpression: "set userRole = :byRoleId, updatedOn = :byDate",
      ExpressionAttributeValues: {
        ":byRoleId": roleId,
        ":byDate": new Date().toUTCString(),
      },
      ReturnValues: "UPDATED_NEW",
    };
    await docClient.update(param).promise(); //for adding data to DB
    numberOfUpdatedUser++;
  }

  if (numberOfUpdatedUser === updatedUserIds.length) {
    return {
      status: true,
      message: message.success.ROLE_ASSIGN_TO_USER,
      data: {},
    } as IRoleSuccessResponse;
    //#endregion
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

async function roleDetail(
  roleId: UUID
): Promise<IRoleErrorResponse | IRoleSuccessResponse> {
  const fetchRoleParams = {
    TableName: process.env.aws_TableName,
    Key: {
      PK: "ROLE",
      SK: roleId,
    },
  };
  const roleDetail = await docClient.get(fetchRoleParams).promise();
  if (Object.keys(roleDetail).length === 0) {
    return {
      status: false,
      message: message.error.ROLE_NOT_FOUND,
      data: {},
    } as IRoleErrorResponse;
  } else {
    return {
      status: true,
      message: message.success.ROLE_FETCH,
      data: roleDetail.Item,
    } as IRoleSuccessResponse;
  }
}
