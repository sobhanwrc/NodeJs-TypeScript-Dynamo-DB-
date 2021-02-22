import AWS from 'aws-sdk';
import bcrypt from 'bcrypt';
import { message } from '../constants/message.constant';

const EmailNotificationService = require('../notification/emailNotification.service')

const awsConfig = {
    "region" : process.env.aws_region,
    "endpoint" : process.env.aws_endpoint,
    "accessKeyId" : process.env.aws_accessKeyId,
    "secretAccessKey" : process.env.aws_secretAccessKey
};
AWS.config.update(awsConfig);

const docClient = new AWS.DynamoDB.DocumentClient();

const saltRounds = 10;

export const registration = async (saveQueryParams) => {
    //#region checking user is duplicate or not
    const isExist = {
        TableName: process.env.aws_TableName,
        Key:{
            "PK" : "USR",
            "SK" : saveQueryParams.emailId
        }
    };
    const userIsDuplicate = await docClient.get(isExist).promise();
    //#endregion

    //#region fetching Customer role detail
    const getRole = {
        TableName: process.env.aws_TableName,
        KeyConditionExpression: "#partitionKey = :PK",
        ExpressionAttributeNames:{
            "#partitionKey": "PK",
            "#roleType" : "roleName"
        },
        ExpressionAttributeValues: {
            ":PK": "ROLE",
            ":roleType" : "customer"
        },
        FilterExpression: "#roleType = :roleType"
    };
    const fetchCustomerRoleDetail = await docClient.query(getRole).promise();
    let customerRoleId = null
    if(fetchCustomerRoleDetail.Items.length > 0){
        customerRoleId = fetchCustomerRoleDetail.Items[0].SK
    }
    //#endregion

    if(Object.keys(userIsDuplicate).length > 0){
        return false
    }else{
        const hash = bcrypt.hashSync(saveQueryParams.password, saltRounds);
        const obj = {
            PK: "USR",
            SK: saveQueryParams.emailId,
            userId : saveQueryParams.userId.toLowerCase(),
            firstName : saveQueryParams.firstName,
            lastName : saveQueryParams.lastName,
            mobileNumber : saveQueryParams.mobileNumber,
            emailId : saveQueryParams.emailId,
            userRole : customerRoleId,
            userStatus : false,
            password : hash,
            emailVerified : false,
            createdOn : new Date().toUTCString(),
            updatedOn : new Date().toUTCString(),
        };
        const params = {
            TableName: process.env.aws_TableName,
            Item: obj
        };
        const item = await docClient.put(params).promise(); //for adding data to DB

        //#region sent email for account verification
        const verifiedEmailLink = `${process.env.HOST}:${process.env.PORT}/api/user-email-verified/${obj.SK}`;

        const userDetailObj = {
            firstName : obj.firstName,
            verifiedEmailLink
        }

        EmailNotificationService('userVerifiedMail')(obj.emailId, userDetailObj).send();
        //#endregion

        return item;
    }
}

export const welcomeEmailSent = async (userId) => {
    //#region get user detail
    const isExist = {
        TableName: process.env.aws_TableName,
        Key:{
            "PK" : "USR",
            "SK" : userId
        }
    };
    const userIsExistOrNot = await docClient.get(isExist).promise();
    //#endregion

    /**Sent welcome mail to a user */
    EmailNotificationService('userWelcomeMail')(userIsExistOrNot.Item.emailId, userIsExistOrNot.Item).send();
}

export const login = async (loginObj) => {
    const emailId = loginObj.emailId
    const password = loginObj.password

    const params = {
        TableName: process.env.aws_TableName,
        Key:{
            "PK" : "USR",
            "SK" : emailId
        }
    }

    const isExist = await docClient.get(params).promise();

    if(Object.keys(isExist).length > 0){
        const isPasswordMatch = bcrypt.compareSync(password, isExist.Item.password);

        if(isPasswordMatch === true){
            if(isExist.Item.emailVerified === false){
                return{
                    status : false,
                    message:message.error.EMAIL_NOT_VERIFIED
                }
            }
            const userRoleId = isExist.Item.userRole
            const fetchRoleObj = {
                TableName: process.env.aws_TableName,
                Key:{
                    "PK" : "ROLE",
                    "SK" : userRoleId
                }
            }
            const getRoleDetail = await docClient.get(fetchRoleObj).promise();
            if(Object.keys(getRoleDetail).length === 0){
                return{
                    status : false,
                    message:message.error.ROLE_NOT_FOUND
                }
            }else{
                const loginSuccessRespObj = {
                    firstName : isExist.Item.firstName,
                    lastName : isExist.Item.lastName,
                    emailId : isExist.Item.emailId,
                    userId : isExist.Item.userId,
                    mobileNumber : isExist.Item.mobileNumber,
                    SK : isExist.Item.SK,
                    PK : isExist.Item.PK,
                    userRole : isExist.Item.userRole,
                    userType : getRoleDetail.Item.roleName
                }
                return{
                    status : true,
                    data : loginSuccessRespObj
                }
            }
        }else{
            return{
                status : false,
                message: message.error.PASSWORD_NOT_MATCH
            }
        }
    }else{
        return{
            status : false,
            message: message.error.USER_NOT_FOUND
        }
    }
}

export const getAllUsers = async () => {
    try {
        const params = {
            TableName: process.env.aws_TableName,
            KeyConditionExpression: "#partitionKey = :PK",
            ExpressionAttributeNames:{
                "#partitionKey": "PK"
            },
            ExpressionAttributeValues: {
                ":PK": "USR"
            },
            ScanIndexForward: false, //DESC ORDER, Set 'true' if u want asc order
        };
    
        const item = await docClient.query(params).promise(); //for getting matching data from DB using query condition
        console.log(item, 'item')
        return item;
    } catch (error) {
        throw error;
    }
};

export const createUsers = async (saveQueryParams) => {
    //#region checking user is duplicate or not
    const isExist = {
        TableName: process.env.aws_TableName,
        Key:{
            "PK" : "USR",
            "SK" : saveQueryParams.emailId
        }
    };
    const userIsDuplicate = await docClient.get(isExist).promise();
    //#endregion

    if(Object.keys(userIsDuplicate).length > 0){
        return false
    }else{
        const hash = bcrypt.hashSync(saveQueryParams.password, saltRounds);
        const obj = {
            ...saveQueryParams,
            PK: "USR",
            SK: saveQueryParams.emailId,
            userId : saveQueryParams.emailId,
            userStatus : true,
            createdOn : new Date().toUTCString(),
            updatedOn : new Date().toUTCString(),
            password : hash
        };
        const params = {
            TableName: process.env.aws_TableName,
            Item: obj
        };
        const item = await docClient.put(params).promise(); //for adding data to DB
        return item;
    }
};

export const updateUser = async (id, updateQueryParams) => {
    const params = {
        TableName : process.env.aws_TableName,
        Key:{
            "PK" : "USR",
            "SK" : id
        },
        UpdateExpression: "set firstName = :byUser, lastName = :byLastName, mobileNumber = :byMobileNumber, userRole = :byRole, userStatus = :byStatus, updatedOn = :byDate",
        ExpressionAttributeValues:{
            ":byUser" : updateQueryParams.firstName,
            ":byLastName" : updateQueryParams.lastName,
            ":byMobileNumber" : updateQueryParams.mobileNumber,
            ":byRole" : updateQueryParams.userRole,
            ":byStatus" : updateQueryParams.userStatus,
            ":byDate" : updateQueryParams.updatedOn
        },
        ReturnValues:"UPDATED_NEW"
    };
    const updateResp = await docClient.update(params).promise();
    return updateResp.Attributes;
};

export const deleteUser = async (userId) => {
    const params = {
        TableName: process.env.aws_TableName,
        Key:{
            "PK" : "USR",
            "SK" : userId
        }
    };

    const item = await docClient.delete(params).promise(); //for deleting matching data from DB
    return item;
}

export const activateOrDeactivateUser = async (id, updateQueryParams) => {
    //#region checking user is in DB or not
    const isExist = {
        TableName: process.env.aws_TableName,
        Key:{
            "PK" : "USR",
            "SK" : id
        }
    };
    const userIsExistOrNot = await docClient.get(isExist).promise();
    //#endregion

    if(Object.keys(userIsExistOrNot).length > 0){
        const params = {
            TableName : process.env.aws_TableName,
            Key:{
                "PK" : "USR",
                "SK" : id
            },
            UpdateExpression: "set user_status = :changeStatus",
            ExpressionAttributeValues:{
                ":changeStatus" : updateQueryParams.user_status
            },
            ReturnValues:"UPDATED_NEW"
        };
        const updateResp = await docClient.update(params).promise();
        return updateResp.Attributes;
    }else{
        return false
    }
}

export const fetchUserByEmailOrUserId = async (userId) => {
    const isExist = {
        TableName: process.env.aws_TableName,
        Key:{
            "PK" : "USR",
            "SK" : userId
        }
    };
    const userIsExistOrNot = await docClient.get(isExist).promise();

    if(Object.keys(userIsExistOrNot).length > 0){
        return true
    }

    return false
}

export const forgotPasswordUpdate = async (updateQueryParams) => {
    const newPassword = bcrypt.hashSync(updateQueryParams.confirmPassword, saltRounds);

    const params = {
        TableName : process.env.aws_TableName,
        Key:{
            "PK" : "USR",
            "SK" : updateQueryParams.emailId
        },
        UpdateExpression: "set password = :byUpdatePassword, updatedOn = :byDate",
        ExpressionAttributeValues:{
            ":byUpdatePassword" : newPassword,
            ":byDate" : updateQueryParams.updatedOn
        },
        ReturnValues:"UPDATED_NEW"
    };
    const updateResp = await docClient.update(params).promise();
    return updateResp.Attributes;
}

export const updateEmailVerifiedField = async (updatedUserData) => {
    const params = {
        TableName : process.env.aws_TableName,
        Key:{
            "PK" : "USR",
            "SK" : updatedUserData.userId
        },
        UpdateExpression: "set emailVerified = :byEmail, userStatus = :byStatus, updatedOn = :byDate",
        ExpressionAttributeValues:{
            ":byEmail" : updatedUserData.emailVerified,
            ":byStatus" : true,
            ":byDate" : updatedUserData.updatedOn
        },
        ReturnValues:"UPDATED_NEW"
    };
    const updateResp = await docClient.update(params).promise();
    return updateResp.Attributes;
}

