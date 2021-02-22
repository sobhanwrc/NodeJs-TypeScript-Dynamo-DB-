import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { message } from '../constants/message.constant';
import postLogDetail from "../auditLogs/addLogs"

const awsConfig = {
    "region" : process.env.aws_region,
    "endpoint" : process.env.aws_endpoint,
    "accessKeyId" : process.env.aws_accessKeyId,
    "secretAccessKey" : process.env.aws_secretAccessKey
};
AWS.config.update(awsConfig);

const docClient = new AWS.DynamoDB.DocumentClient();

export async function addRole(payload) {
    //#region checking role is already exist or not
    const getRole = {
        TableName: process.env.aws_TableName,
        KeyConditionExpression: "#partitionKey = :PK",
        ExpressionAttributeNames:{
            "#partitionKey": "PK",
            "#roleType" : "roleName"
        },
        ExpressionAttributeValues: {
            ":PK": "ROLE",
            ":roleType" : payload.roleName.toLowerCase()
        },
        FilterExpression: "#roleType = :roleType"
    };
    const fetchCustomerRoleDetail = await docClient.query(getRole).promise();
    
    if(fetchCustomerRoleDetail.Items.length > 0){
        return {
            status : false,
            message : message.error.ROLE_EXIST
        }
    }
    //#endregion

    //#region adding new role
    const addObj = {
        PK : "ROLE",
        SK : uuidv4(),
        roleName : payload.roleName.toLowerCase(),
        description : payload.description,
        roleStatus : true,
        createdOn : new Date().toUTCString(),
        updatedOn : new Date().toUTCString()
    }

    const params = {
        TableName: process.env.aws_TableName,
        Item: addObj
    };
    const addRoleResp = await docClient.put(params).promise(); //for adding data to DB

    //#region for audit logs
    const oldValueForLog = {}
    const newValueForLog = addObj
    const addLogDetailObj = {
        roleId : addObj.SK,
        entity : "ROLE",
        event : "Add",
        objOldData : oldValueForLog,
        objNewData : newValueForLog,
        createdOn : new Date().toUTCString(),
        updatedOn : new Date().toUTCString(),
    }
    await postLogDetail(addLogDetailObj);
    //#endregion

    return {
        status : true,
        message : message.success.ROLE_ADD,
        data : {}
    }
    //#endregion
}

export async function updateRole(payload) {
    //#region fetch role by Id
    const fetchRoleParams = {
        TableName: process.env.aws_TableName,
        Key : {
            PK : "ROLE",
            SK : payload.roleId
        }
    }
    const roleDetail = await docClient.get(fetchRoleParams).promise();
    if(Object.keys(roleDetail).length === 0){
        return{
            status : true,
            message : message.error.ROLE_NOT_FOUND,
            data : {}
        }
    }
    //#endregion

    //#region checking role is already exist or not
    const getRole = {
        TableName: process.env.aws_TableName,
        KeyConditionExpression: "#partitionKey = :PK",
        ExpressionAttributeNames:{
            "#partitionKey": "PK",
            "#roleType" : "roleName"
        },
        ExpressionAttributeValues: {
            ":PK": "ROLE",
            ":roleType" : payload.roleName.toLowerCase(),
            ":existingRole" : roleDetail.Item.roleName
        },
        FilterExpression: "#roleType = :roleType AND #roleType <> :existingRole"
    };
    const fetchCustomerRoleDetail = await docClient.query(getRole).promise();
    if(fetchCustomerRoleDetail.Items.length > 0){
        return {
            status : false,
            message : message.error.ROLE_EXIST
        }
    }
    //#endregion

    //#region update role
    const updateObj = {
        roleId : payload.roleId,
        roleName : payload.roleName.toLowerCase(),
        description : payload.description,
        roleStatus : payload.status,
        updatedOn : new Date().toUTCString()
    }

    const params = {
        TableName : process.env.aws_TableName,
        Key:{
            "PK" : "ROLE",
            "SK" : updateObj.roleId
        },
        UpdateExpression: "set roleName = :byName, description = :byDesc, roleStatus = :status, updatedOn = :byDate",
        ExpressionAttributeValues:{
            ":byName" : updateObj.roleName,
            ":byDesc" : updateObj.description,
            ":status" : updateObj.roleStatus,
            ":byDate" : updateObj.updatedOn
        },
        ReturnValues:"UPDATED_NEW"
    };

    console.log(params, 'params')
    const addRoleResp = await docClient.update(params).promise(); //for adding data to DB

    //#region for audit logs
    const oldValueForLog = roleDetail.Item;
    const newValueForLog = updateObj
    const addLogDetailObj = {
        roleId : payload.roleId,
        entity : "ROLE",
        event : "Edit",
        objOldData : oldValueForLog,
        objNewData : newValueForLog,
        createdOn : new Date().toUTCString(),
        updatedOn : new Date().toUTCString(),
    }
    await postLogDetail(addLogDetailObj);

    return {
        status : true,
        message : message.success.ROLE_UPDATE,
        data : addRoleResp
    }
    //#endregion
}

export async function deleteRole(roleId) {
    //#region fetch role detail
    const fetchRoleParams = {
        TableName: process.env.aws_TableName,
        Key : {
            PK : "ROLE",
            SK : roleId
        }
    }
    const roleDetail = await docClient.get(fetchRoleParams).promise();
    if(Object.keys(roleDetail).length === 0){
        return{
            status : true,
            message : message.error.ROLE_NOT_FOUND,
            data : {}
        }
    }
    //#endregion

    //#region delete role
    const deleteRoleParams = {
        TableName: process.env.aws_TableName,
        Key : {
            PK : "ROLE",
            SK : roleId
        }
    }
    const deleteRoleResp = await docClient.delete(deleteRoleParams).promise();
    //#endregion

    return{
        status : true,
        message : message.success.ROLE_DELETE,
        data : deleteRoleResp
    }
}

export async function listRole() {
    const fetchAllRolesParam = {
        TableName: process.env.aws_TableName,
        KeyConditionExpression: "#partitionKey = :PK",
        ExpressionAttributeNames:{
            "#partitionKey": "PK"
        },
        ExpressionAttributeValues: {
            ":PK": "ROLE"
        },
    }
    const allRoles = await docClient.query(fetchAllRolesParam).promise();
    return{
        status : true,
        message : message.success.ROLE_LIST,
        data : allRoles
    }
}