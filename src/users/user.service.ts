import AWS from 'aws-sdk';
import { Console } from 'console';
import { Error } from 'mongoose';

const awsConfig = {
    "region" : process.env.aws_region,
    "endpoint" : process.env.aws_endpoint,
    "accessKeyId" : process.env.aws_accessKeyId,
    "secretAccessKey" : process.env.aws_secretAccessKey
};
AWS.config.update(awsConfig);

const docClient = new AWS.DynamoDB.DocumentClient();

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
    const obj = {
        ...saveQueryParams,
        PK: "USR",
        SK: saveQueryParams.emailId,
        userId : saveQueryParams.emailId,
        status : true,
        created_on : new Date().toUTCString(),
        updated_on : new Date().toUTCString()
    };
    const params = {
        TableName: process.env.aws_TableName,
        Item: obj
    };
    const item = await docClient.put(params).promise(); //for adding data to DB
    console.log(item,'item')
    return item;
};

export const updateUser = async (id, updateQueryParams) => {
    const params = {
        TableName : process.env.aws_TableName,
        Key:{
            "PK" : "USR",
            "SK" : id
        },
        UpdateExpression: "set firstName = :byUser",
        ExpressionAttributeValues:{
            ":byUser" : updateQueryParams.firstName
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

