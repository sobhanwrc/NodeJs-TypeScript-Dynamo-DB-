import AWS from "aws-sdk";
import * as GeneratePassword from "generate-password";
import bcrypt from "bcrypt";
import { message } from "../constants/message.constant";
import _ from "lodash";
import {
  User,
  IUserErrorResponse,
  IUserSuccessResponse,
  IEmailVerifiedParam,
  IForgotPasswordUpdateQueryParams,
  IChangePasswordUpdateQueryParams,
  IUserData,
} from "./user.interface";

import {
  DeleteItemOutput,
  QueryOutput,
  UpdateItemOutput,
  GetItemOutput,
} from "aws-sdk/clients/dynamodb";
import postLogDetail from "../auditLogs/addLogs";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const EmailNotificationService = require("../notification/emailNotification.service");

const awsConfig = {
  region: process.env.aws_region,
  accessKeyId: process.env.aws_accessKeyId,
  secretAccessKey: process.env.aws_secretAccessKey,
};
AWS.config.update(awsConfig);

const docClient = new AWS.DynamoDB.DocumentClient();

const saltRounds = 10;

export const registration = async (
  saveQueryParams: User
): Promise<IUserSuccessResponse | IUserErrorResponse> => {
  //#region checking user is duplicate or not
  const isExist = {
    TableName: process.env.aws_TableName,
    Key: {
      PK: "USR",
      SK: saveQueryParams.emailId,
    },
  };
  const userIsDuplicate = await docClient.get(isExist).promise();
  //#endregion

  if (Object.keys(userIsDuplicate).length > 0) {
    return {
      status: false,
      message: message.error.USER_EXIST,
      data: {},
    } as IUserErrorResponse;
  } else {
    const hash = bcrypt.hashSync(saveQueryParams.password, saltRounds);
    const obj: User = {
      PK: "USR",
      SK: saveQueryParams.emailId,
      userId: saveQueryParams.userId.toLowerCase(),
      firstName: saveQueryParams.firstName,
      lastName: saveQueryParams.lastName,
      mobileNumber: saveQueryParams.mobileNumber,
      emailId: saveQueryParams.emailId,
      userStatus: false,
      password: hash,
      emailVerified: false,
      createdOn: new Date().toUTCString(),
      updatedOn: new Date().toUTCString(),
    };
    const params = {
      TableName: process.env.aws_TableName,
      Item: obj,
    };
    await docClient.put(params).promise(); //for adding data to DB

    //#region sent email for account verification
    const verifiedEmailLink = `${process.env.HOST}:${process.env.PORT}/api/user-email-verified/${obj.SK}`;

    const userDetailObj = {
      firstName: obj.firstName,
      verifiedEmailLink,
    };

    EmailNotificationService("userVerifiedMail")(
      obj.emailId,
      userDetailObj
    ).send();
    //#endregion

    //#region for audit logs
    const oldValueForLog = {};
    const newValueForLog = obj;
    await auditLog(
      obj.SK,
      "USR",
      "Add",
      oldValueForLog,
      newValueForLog,
      new Date().toUTCString(),
      new Date().toUTCString()
    );
    //#endregion

    return {
      status: true,
      message: message.success.USR_REG,
      data: new User(),
    } as IUserSuccessResponse;
  }
};

export const welcomeEmailSent = async (userId: string): Promise<void> => {
  //#region get user detail
  const isExist = {
    TableName: process.env.aws_TableName,
    Key: {
      PK: "USR",
      SK: userId,
    },
  };
  const userIsExistOrNot = await docClient.get(isExist).promise();
  //#endregion

  /**Sent welcome mail to a user */
  EmailNotificationService("userWelcomeMail")(
    userIsExistOrNot.Item.emailId,
    userIsExistOrNot.Item
  ).send();
};

export const login = async (
  loginObj: User
): Promise<IUserSuccessResponse | IUserErrorResponse> => {
  const emailId = loginObj.emailId;
  const password = loginObj.password;

  const params = {
    TableName: process.env.aws_TableName,
    Key: {
      PK: "USR",
      SK: emailId,
    },
  };

  const isExist = await docClient.get(params).promise();

  if (Object.keys(isExist).length > 0) {
    const isPasswordMatch = bcrypt.compareSync(password, isExist.Item.password);

    if (isPasswordMatch === true) {
      if (isExist.Item.emailVerified === false) {
        return {
          status: false,
          message: message.error.EMAIL_NOT_VERIFIED,
          data: {},
        } as IUserErrorResponse;
      }

      if (isExist.Item.userStatus === false) {
        //inactive
        return {
          status: false,
          message: message.error.USER_INACTIVE,
          data: {},
        } as IUserErrorResponse;
      }

      const userRoleId = isExist.Item.userRole;
      const fetchRoleObj = {
        TableName: process.env.aws_TableName,
        Key: {
          PK: "ROLE",
          SK: userRoleId,
        },
      };
      const getRoleDetail = await docClient.get(fetchRoleObj).promise();
      if (Object.keys(getRoleDetail).length === 0) {
        return {
          status: false,
          message: message.error.ROLE_NOT_FOUND,
          data: {},
        } as IUserSuccessResponse;
      } else {
        const loginSuccessRespObj: User = {
          firstName: isExist.Item.firstName,
          lastName: isExist.Item.lastName,
          emailId: isExist.Item.emailId,
          userId: isExist.Item.userId,
          mobileNumber: isExist.Item.mobileNumber,
          SK: isExist.Item.SK,
          PK: isExist.Item.PK,
          userRole: isExist.Item.userRole,
          userType: getRoleDetail.Item.roleName,
        };
        return {
          status: true,
          message: message.success.USR_LOGIN,
          data: loginSuccessRespObj,
        } as IUserSuccessResponse;
      }
    } else {
      return {
        status: false,
        message: message.error.PASSWORD_NOT_MATCH,
        data: {},
      } as IUserErrorResponse;
    }
  } else {
    return {
      status: false,
      message: message.error.USER_NOT_FOUND,
      data: {},
    } as IUserErrorResponse;
  }
};

export const getAllUsers = async (
  userData: IUserData
): Promise<IUserSuccessResponse | IUserErrorResponse> => {
  //#region fetch Role master list
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
  //#endregion

  const userFilterType = userData.userType.toLowerCase();
  let ExpressionAttributeNamesObj = {},
    ExpressionAttributeValuesObj = {},
    FilterExpressionObj = {};

  const customerRole = await _.filter(
    allRoles.Items,
    (item) => item.roleName === "customer"
  );
  const customerRoleId = customerRole[0].SK;

  if (userFilterType === "customer") {
    ExpressionAttributeNamesObj = {
      ExpressionAttributeNames: {
        "#partitionKey": "PK",
        "#roleFieldType": "userRole",
      },
    };

    ExpressionAttributeValuesObj = {
      ExpressionAttributeValues: {
        ":PK": "USR",
        ":userRole": customerRoleId,
      },
    };

    FilterExpressionObj = {
      FilterExpression: "#roleFieldType = :userRole",
    };
  } else if (userFilterType === "backend_user") {
    ExpressionAttributeNamesObj = {
      ExpressionAttributeNames: {
        "#partitionKey": "PK",
        "#roleFieldType": "userRole",
      },
    };

    ExpressionAttributeValuesObj = {
      ExpressionAttributeValues: {
        ":PK": "USR",
        ":userRole": customerRoleId,
      },
    };

    FilterExpressionObj = {
      FilterExpression: "#roleFieldType <> :userRole",
    };
  } else {
    ExpressionAttributeNamesObj = {
      ExpressionAttributeNames: {
        "#partitionKey": "PK",
      },
    };

    ExpressionAttributeValuesObj = {
      ExpressionAttributeValues: {
        ":PK": "USR",
      },
    };
  }

  const params = {
    TableName: process.env.aws_TableName,
    KeyConditionExpression: "#partitionKey = :PK",
    ...ExpressionAttributeNamesObj,
    ...ExpressionAttributeValuesObj,
    ...FilterExpressionObj,
    ScanIndexForward: false, //DESC ORDER, Set 'true' if u want asc order
  };

  const item: QueryOutput = await docClient.query(params).promise(); //for getting matching data from DB using query condition

  return {
    status: true,
    message: message.success.USR_GET,
    data: item,
  } as IUserSuccessResponse;
};

export const createUsers = async (
  saveQueryParams: User
): Promise<IUserSuccessResponse | IUserErrorResponse> => {
  //#region checking user is duplicate or not
  const userIsDuplicate = await userExistChecking(saveQueryParams.emailId);
  //#endregion

  if (userIsDuplicate !== undefined) {
    return {
      status: false,
      message: message.error.USER_EXIST,
      data: {},
    } as IUserErrorResponse;
  } else {
    const randomPassword = GeneratePassword.generate({
      length: 7,
      numbers: true,
      lowercase: true,
      uppercase: true,
    });
    const userLoginPassword = `${randomPassword}@`;
    console.log(userLoginPassword, "userLoginPassword");
    const hash = bcrypt.hashSync(userLoginPassword, saltRounds);

    const obj: User = {
      ...saveQueryParams,
      PK: "USR",
      SK: saveQueryParams.emailId,
      userId: saveQueryParams.userId,
      userStatus: true,
      createdOn: new Date().toUTCString(),
      updatedOn: new Date().toUTCString(),
      password: hash,
    };
    const params = {
      TableName: process.env.aws_TableName,
      Item: obj,
    };
    await docClient.put(params).promise(); //for adding data to DB

    //#region sent email to user with login credential
    const userDetailObj = {
      firstName: saveQueryParams.firstName,
      loginId: saveQueryParams.emailId,
      password: userLoginPassword,
    };
    EmailNotificationService("addUserWithLoginCredential")(
      saveQueryParams.emailId,
      userDetailObj
    ).send();
    //#endregion

    //#region for audit logs
    const oldValueForLog = {};
    const newValueForLog = obj;
    await auditLog(
      obj.SK,
      "USR",
      "Add",
      oldValueForLog,
      newValueForLog,
      new Date().toUTCString(),
      new Date().toUTCString()
    );
    //#endregion

    return {
      status: true,
      message: message.success.USR_ADD,
      data: {},
    } as IUserSuccessResponse;
  }
};

export const updateUser = async (
  id: string,
  updateQueryParams: User
): Promise<IUserSuccessResponse | IUserErrorResponse> => {
  //#region checking user is exist or not
  const isExist = await userExistChecking(id);
  if (isExist === undefined) {
    return {
      status: true,
      message: message.error.USER_NOT_FOUND,
      data: {},
    } as IUserErrorResponse;
  }
  //#endregion

  //#region Update user
  const params = {
    TableName: process.env.aws_TableName,
    Key: {
      PK: "USR",
      SK: id,
    },
    UpdateExpression:
      "set firstName = :byUser, lastName = :byLastName, mobileNumber = :byMobileNumber, userRole = :byRole, userStatus = :byStatus, updatedOn = :byDate",
    ExpressionAttributeValues: {
      ":byUser": updateQueryParams.firstName,
      ":byLastName": updateQueryParams.lastName,
      ":byMobileNumber": updateQueryParams.mobileNumber,
      ":byRole": updateQueryParams.userRole,
      ":byStatus": updateQueryParams.userStatus,
      ":byDate": updateQueryParams.updatedOn,
    },
    ReturnValues: "UPDATED_NEW",
  };
  const updateResp: UpdateItemOutput = await docClient.update(params).promise();
  //#endregion

  //#region for audit logs
  const oldValueForLog = isExist;
  const newValueForLog = updateQueryParams;
  await auditLog(
    id,
    "USR",
    "Edit",
    oldValueForLog,
    newValueForLog,
    new Date().toUTCString(),
    new Date().toUTCString()
  );
  //#endregion

  return {
    status: true,
    message: message.success.USR_UPDATE,
    data: updateResp,
  } as IUserSuccessResponse;
};

export const deleteUser = async (
  userId: string
): Promise<IUserSuccessResponse | IUserErrorResponse> => {
  //#region checking user is exist or not
  const isExist = await userExistChecking(userId);
  if (isExist === undefined) {
    return {
      status: true,
      message: message.error.USER_NOT_FOUND,
      data: {},
    } as IUserErrorResponse;
  }
  //#endregion

  //#region Delete user
  const params = {
    TableName: process.env.aws_TableName,
    Key: {
      PK: "USR",
      SK: userId,
    },
  };

  const item: DeleteItemOutput = await docClient.delete(params).promise(); //for deleting matching data from DB
  //#endregion

  //#region for audit logs
  const oldValueForLog = isExist;
  const newValueForLog = {};
  await auditLog(
    userId,
    "USR",
    "Delete",
    oldValueForLog,
    newValueForLog,
    new Date().toUTCString(),
    new Date().toUTCString()
  );
  //#endregion

  return {
    status: true,
    message: message.success.USR_DELETE,
    data: item,
  } as IUserSuccessResponse;
};

export const activateOrDeactivateUser = async (
  id: string,
  updateQueryParams: IEmailVerifiedParam
): Promise<IUserSuccessResponse | IUserErrorResponse> => {
  const params = {
    TableName: process.env.aws_TableName,
    Key: {
      PK: "USR",
      SK: id,
    },
    UpdateExpression: "set userStatus = :changeStatus",
    ExpressionAttributeValues: {
      ":changeStatus": updateQueryParams.userStatus,
    },
    ReturnValues: "UPDATED_NEW",
  };
  const updateResp: UpdateItemOutput = await docClient.update(params).promise();
  return {
    status: true,
    message: message.success.USER_STATUS_UPDATE,
    data: updateResp,
  } as IUserSuccessResponse;
};

export const fetchUserByEmailOrUserId = async (
  userId: string
): Promise<boolean> => {
  const isExist = {
    TableName: process.env.aws_TableName,
    Key: {
      PK: "USR",
      SK: userId,
    },
  };
  const userIsExistOrNot = await docClient.get(isExist).promise();

  if (Object.keys(userIsExistOrNot).length > 0) {
    return true;
  }

  return false;
};

export const forgotPasswordUpdate = async (
  updateQueryParams: IForgotPasswordUpdateQueryParams
): Promise<IUserSuccessResponse | IUserErrorResponse> => {
  const newPassword = bcrypt.hashSync(
    updateQueryParams.confirmPassword,
    saltRounds
  );

  const params = {
    TableName: process.env.aws_TableName,
    Key: {
      PK: "USR",
      SK: updateQueryParams.emailId,
    },
    UpdateExpression: "set password = :byUpdatePassword, updatedOn = :byDate",
    ExpressionAttributeValues: {
      ":byUpdatePassword": newPassword,
      ":byDate": updateQueryParams.updatedOn,
    },
    ReturnValues: "UPDATED_NEW",
  };
  const updateResp: UpdateItemOutput = await docClient.update(params).promise();
  return {
    status: true,
    message: message.success.FORGOT_OR_CHANGE_PASSWORD_UPDATE,
    data: updateResp,
  } as IUserSuccessResponse;
};

export const updateEmailVerifiedField = async (
  updatedUserData: User
): Promise<IUserSuccessResponse | IUserErrorResponse> => {
  const params = {
    TableName: process.env.aws_TableName,
    Key: {
      PK: "USR",
      SK: updatedUserData.userId,
    },
    UpdateExpression:
      "set emailVerified = :byEmail, userStatus = :byStatus, updatedOn = :byDate",
    ExpressionAttributeValues: {
      ":byEmail": updatedUserData.emailVerified,
      ":byStatus": true,
      ":byDate": updatedUserData.updatedOn,
    },
    ReturnValues: "UPDATED_NEW",
  };
  const updateResp: UpdateItemOutput = await docClient.update(params).promise();
  return {
    status: true,
    message: message.success.ROLE_UPDATE,
    data: updateResp,
  } as IUserSuccessResponse;
};

export const forgotPasswordMailSent = async (
  userEmailId: string
): Promise<void> => {
  //#region get user detail
  const isExist = {
    TableName: process.env.aws_TableName,
    Key: {
      PK: "USR",
      SK: userEmailId,
    },
  };
  const userIsExistOrNot = await docClient.get(isExist).promise();
  //#endregion

  const forgotPasswordLink = `${process.env.FRONTEND_HOST}/forgot-password?email=${userEmailId} `;

  const userObj = {
    ...userIsExistOrNot.Item,
    forgotPasswordLink,
  };

  /**Sent welcome mail to a user */
  EmailNotificationService("forgotPasswordEmail")(
    userIsExistOrNot.Item.emailId,
    userObj
  ).send();
};

export const changePassword = async (
  updateQueryParams: IChangePasswordUpdateQueryParams
): Promise<IUserSuccessResponse | IUserErrorResponse> => {
  //#region fetch user detail for checking old password is matching or not
  const fetchDetail = await userExistChecking(updateQueryParams.emailId);
  if (fetchDetail === undefined) {
    return {
      status: false,
      message: message.error.USER_NOT_FOUND,
      data: {},
    } as IUserErrorResponse;
  }
  //#endregion
  else {
    const isOldPasswordMatch = bcrypt.compareSync(
      updateQueryParams.oldPassword,
      fetchDetail.password
    );
    if (isOldPasswordMatch === false) {
      return {
        status: false,
        message: message.error.USER_OLD_PASSWORD_NOT_MATCH,
        data: {},
      } as IUserErrorResponse;
    } else {
      //#region checking new password is same as old password or not. If yes then throw error
      const isNewAndOldPasswordMatch = bcrypt.compareSync(
        updateQueryParams.confirmPassword,
        fetchDetail.password
      );
      //#endregion
      if (isNewAndOldPasswordMatch === true) {
        return {
          status: false,
          message: message.error.USER_OLD_NEW_PASSWORD_CAN_NOT_SAME,
          data: {},
        } as IUserErrorResponse;
      } else {
        const newPassword = bcrypt.hashSync(
          updateQueryParams.confirmPassword,
          saltRounds
        );

        const params = {
          TableName: process.env.aws_TableName,
          Key: {
            PK: "USR",
            SK: updateQueryParams.emailId,
          },
          UpdateExpression:
            "set password = :byUpdatePassword, updatedOn = :byDate",
          ExpressionAttributeValues: {
            ":byUpdatePassword": newPassword,
            ":byDate": updateQueryParams.updatedOn,
          },
          ReturnValues: "UPDATED_NEW",
        };
        const updateResp: UpdateItemOutput = await docClient
          .update(params)
          .promise();
        return {
          status: true,
          message: message.success.CHANGE_PASSWORD_UPDATE,
          data: updateResp,
        } as IUserSuccessResponse;
      }
    }
  }
};

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

async function userExistChecking(userId: string): Promise<User> {
  const fetchUserParams = {
    TableName: process.env.aws_TableName,
    Key: {
      PK: "USR",
      SK: userId,
    },
  };
  const userDetail: GetItemOutput = await docClient
    .get(fetchUserParams)
    .promise();
  return userDetail.Item;
}
