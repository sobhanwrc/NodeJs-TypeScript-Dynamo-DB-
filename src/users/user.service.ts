import AWS from 'aws-sdk';
import bcrypt from 'bcrypt';

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

    if(Object.keys(userIsDuplicate).length > 0){
        return false
    }else{
        const hash = bcrypt.hashSync(saveQueryParams.password, saltRounds);
        const obj = {
            PK: "USR",
            SK: saveQueryParams.emailId,
            userId : saveQueryParams.emailId,
            firstName : saveQueryParams.firstName,
            lastName : saveQueryParams.lastName,
            mobileNumber : saveQueryParams.mobileNumber,
            emailId : saveQueryParams.emailId,
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
}

export const login = async (loginObj) => {
    const userId = loginObj.userId
    const password = loginObj.password

    const params = {
        TableName: process.env.aws_TableName,
        Key:{
            "PK" : "USR",
            "SK" : userId
        }
    }

    const isExist = await docClient.get(params).promise();

    if(Object.keys(isExist).length > 0){
        const isPasswordMatch = bcrypt.compareSync(password, isExist.Item.password);

        if(isPasswordMatch === true){
            return{
                status : true,
                data : isExist.Item
            }
        }else{
            return{
                status : false,
                message: "UserId or Password is wrong."
            }
        }
    }else{
        return{
            status : false,
            message: "User not found."
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

