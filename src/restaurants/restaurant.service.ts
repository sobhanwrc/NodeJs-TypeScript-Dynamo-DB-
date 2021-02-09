import restaurantModel from './restaurant.model';
import AWS from 'aws-sdk';

const awsConfig = {
    "region" : process.env.aws_region,
    "endpoint" : process.env.aws_endpoint,
    "accessKeyId" : process.env.aws_accessKeyId,
    "secretAccessKey" : process.env.aws_secretAccessKey
};
AWS.config.update(awsConfig);

const docClient = new AWS.DynamoDB.DocumentClient();

export const getAllRestaurants = async () => {
    const params = {
        TableName: "restaurants"
    };
    const item = await docClient.scan(params).promise(); //for fetching all data from DB
    return item.Items;
    // return await restaurantModel.find();
};

export const searchRestaurants = async (keyword) => {
    return await restaurantModel.aggregate([
        { $match: { name: new RegExp(`${keyword}`, 'i') } }
    ]);
};

export const createRestaurants = async (saveQueryParams) => {
    const obj = {
        ...saveQueryParams,
        restaurant_id : "15"
    }
    const params = {
        TableName: "restaurants",
        Item: obj
    };
    const item = await docClient.put(params).promise(); //for adding data to DB
    return item;
    // const createdData = new restaurantModel(saveQueryParams);
    // return await createdData.save();
};

export const getRestaurant = async (id) => {
    const params = {
        TableName : "restaurants",
        Key:{
            "restaurant_id" : id
        }
    };

    const item = await docClient.get(params).promise(); //for getting matching data from DB
    return item;

    // return await restaurantModel.findOne({ _id: id });
};

export const updateRestaurants = async (id, updateQueryParams) => {
    const params = {
        TableName : "restaurants",
        Key:{
            "restaurant_id" : id
        },
        UpdateExpression: "set firstName = :byUser",
        ExpressionAttributeValues:{
            ":byUser" : updateQueryParams.name
        },
        ReturnValues:"UPDATED_NEW"
    };
    const updateResp = await docClient.update(params).promise();
    return updateResp.Attributes
    // return await restaurantModel.findOneAndUpdate({ _id: id}, updateQueryParams);
};

export const deleteRestaurant = async (id) => {
    const params = {
        TableName : "restaurants",
        Key:{
            "restaurant_id" : id
        }
    };

    const item = await docClient.delete(params).promise(); //for deleteing matching data from DB
    return item;
}

