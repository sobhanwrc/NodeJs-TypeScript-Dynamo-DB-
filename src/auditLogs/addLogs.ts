import AWS from "aws-sdk";
import { IAuditLogObj } from "./auditLog.interface";

const awsConfig = {
  region: process.env.aws_region,
  endpoint: process.env.aws_endpoint,
  accessKeyId: process.env.aws_accessKeyId,
  secretAccessKey: process.env.aws_secretAccessKey,
};
AWS.config.update(awsConfig);

const docClient = new AWS.DynamoDB.DocumentClient();

export default async function postLogDetail(
  logDetail: IAuditLogObj
): Promise<boolean> {
  const newData = logDetail.objNewData;
  const oldData = logDetail.objOldData;

  const eventChanges = {};

  if (Object.keys(newData).length > 0) {
    for (let i = 0; i < Object.keys(newData).length; i++) {
      const field = Object.keys(newData)[i];
      const newFieldValue = Object.values(newData)[i];
      let oldFieldValue;
      if (Object.keys(oldData).length > 0) {
        for (let j = 0; j < Object.keys(oldData).length; j++) {
          if (field === Object.keys(oldData)[j]) {
            oldFieldValue = Object.values(oldData)[j];
          }
        }
      }
      eventChanges[field] = {
        oldValue: oldFieldValue,
        newValue: newFieldValue,
      };
    }
  } else {
    for (let i = 0; i < Object.keys(oldData).length; i++) {
      const field = Object.keys(oldData)[i];
      const oldFieldValue = Object.values(oldData)[i];
      let newFieldValue;
      if (Object.keys(newData).length > 0) {
        for (let j = 0; j < Object.keys(newData).length; j++) {
          if (field === Object.keys(newData)[j]) {
            newFieldValue = Object.values(newData)[j];
          }
        }
      }
      eventChanges[field] = {
        oldValue: oldFieldValue,
        newValue: newFieldValue,
      };
    }
  }
  delete logDetail.objOldData;
  delete logDetail.objNewData;
  const objLogDetail = { ...logDetail, eventChanges: eventChanges };
  const logAddParam = {
    TableName: process.env.aws_AuditLogTable,
    Item: {
      ...objLogDetail,
      PK: logDetail.entity,
      SK: new Date().toUTCString(),
    },
  };
  const response = await docClient.put(logAddParam).promise(); //for adding data to DB
  if (response) {
    return true;
  } else {
    return false;
  }
}
