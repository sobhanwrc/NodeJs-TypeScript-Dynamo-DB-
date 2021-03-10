/* eslint-disable @typescript-eslint/no-explicit-any */
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import _ from "lodash";
import { message } from "../constants/message.constant";
import {
  Bumpers,
  IBumpersErrorResponse,
  IBumpersSuccessResponse,
} from "./bumpers.interface";

import { QueryOutput } from "aws-sdk/clients/dynamodb";

const awsConfig = {
  region: process.env.aws_region,
  accessKeyId: process.env.aws_accessKeyId,
  secretAccessKey: process.env.aws_secretAccessKey,
};
AWS.config.update(awsConfig);

const docClient = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

export async function fetchDependencyDataOfAdvertiser(
  advId: string
): Promise<IBumpersSuccessResponse | IBumpersErrorResponse> {
  const getBrandsOfAdvertiserParams = {
    TableName: process.env.aws_TableName,
    KeyConditionExpression: "#partitionKey = :PK",
    ExpressionAttributeNames: {
      "#partitionKey": "PK",
    },
    ExpressionAttributeValues: {
      ":PK": advId,
    },
  };
  const brandsOfAdvertiser = await docClient
    .query(getBrandsOfAdvertiserParams)
    .promise();

  //#region fetch brand details
  const categoryDetailsParam = {
    TableName: process.env.aws_TableName,
    KeyConditionExpression: "#partitionKey = :PK",
    ExpressionAttributeNames: {
      "#partitionKey": "PK",
    },
    ExpressionAttributeValues: {
      ":PK": "CATEGORY",
    },
  };
  const categoryMaster = await docClient.query(categoryDetailsParam).promise();
  //#endregion

  //#region fetch brand details
  const brandDetailsParam = {
    TableName: process.env.aws_TableName,
    KeyConditionExpression: "#partitionKey = :PK",
    ExpressionAttributeNames: {
      "#partitionKey": "PK",
    },
    ExpressionAttributeValues: {
      ":PK": "BRAND",
    },
  };
  const brandMaster = await docClient.query(brandDetailsParam).promise();
  //#endregion

  //#region fetch brand details
  const productDetailsParam = {
    TableName: process.env.aws_TableName,
    KeyConditionExpression: "#partitionKey = :PK",
    ExpressionAttributeNames: {
      "#partitionKey": "PK",
    },
    ExpressionAttributeValues: {
      ":PK": "PRODUCT",
    },
  };
  const productMaster = await docClient.query(productDetailsParam).promise();
  //#endregion

  const resultData = await getAdvertiserDetails(
    brandsOfAdvertiser,
    categoryMaster.Items,
    brandMaster.Items,
    productMaster.Items
  );
  return {
    status: false,
    message: "Successful.",
    data: resultData,
  } as IBumpersSuccessResponse;
}

export async function addBumper(
  BumperObj: Bumpers
): Promise<IBumpersSuccessResponse | IBumpersErrorResponse> {
  let bumperSequenceNo = 1;
  //#region find last sequence no
  const fetchParams = {
    TableName: process.env.aws_TableName,
    KeyConditionExpression: "#partitionKey = :PK",
    ExpressionAttributeNames: {
      "#partitionKey": "PK",
    },
    ExpressionAttributeValues: {
      ":PK": "BUMPERS",
    },
    ScanIndexForward: false,
    Limit: 1,
  };
  const item: QueryOutput = await docClient.query(fetchParams).promise();
  if (item.Items.length > 0) {
    const lastInsertedBumperData = item.Items[0] as Bumpers;
    bumperSequenceNo = lastInsertedBumperData.sequenceNo + bumperSequenceNo;
  }
  //#endregion

  const bumperName = BumperObj.bumperName.toLowerCase();

  //#region bumper name unique ness checking
  const checkingParams = {
    TableName: process.env.aws_TableName,
    KeyConditionExpression: "#partitionKey = :PK",
    ExpressionAttributeNames: {
      "#partitionKey": "PK",
      "#bumperName": "bumperName",
    },
    ExpressionAttributeValues: {
      ":PK": "BUMPERS",
      ":bumperName": bumperName,
    },
    FilterExpression: "#bumperName = :bumperName",
  };
  const fetchCustomerRoleDetail = await docClient
    .query(checkingParams)
    .promise();
  if (fetchCustomerRoleDetail.Items.length > 0) {
    return {
      status: false,
      message: message.error.BUMPER_EXIST,
      data: {},
    } as IBumpersErrorResponse;
  }
  //#endregion

  delete BumperObj.bumperName;
  const addBumperData = {
    PK: "BUMPERS",
    SK: uuidv4(),
    ...BumperObj,
    bumperName,
    sequenceNo: bumperSequenceNo,
    createdOn: new Date().toUTCString(),
    updatedOn: new Date().toUTCString(),
  };

  const params = {
    TableName: process.env.aws_TableName,
    Item: addBumperData,
  };

  await docClient.put(params).promise(); //for adding data to DB

  return {
    status: true,
    message: message.success.BUMPER_ADD,
    data: {},
  } as IBumpersSuccessResponse;
}

export async function listBumpers(): Promise<
  IBumpersSuccessResponse | IBumpersErrorResponse
> {
  const fetchAllBumpersParam = {
    TableName: process.env.aws_TableName,
    KeyConditionExpression: "#partitionKey = :PK",
    ExpressionAttributeNames: {
      "#partitionKey": "PK",
    },
    ExpressionAttributeValues: {
      ":PK": "BUMPERS",
    },
    ScanIndexForward: false,
  };
  const allBumpers: QueryOutput = await docClient
    .query(fetchAllBumpersParam)
    .promise();
  return {
    status: true,
    message: message.success.ROLE_LIST,
    data: allBumpers,
  } as IBumpersSuccessResponse;
}

export async function deleteBumpers(
  bumperObj: Array<Bumpers>
): Promise<IBumpersSuccessResponse | IBumpersErrorResponse> {
  for (const bumperDetail of bumperObj) {
    if (bumperDetail.video != "") {
      const videoFileName = bumperDetail.video.split("/")[3];
      await deleteS3Object(videoFileName);
    }

    if (bumperDetail.thumbnail != "") {
      const thumbnailName = bumperDetail.thumbnail.split("/")[3];
      await deleteS3Object(thumbnailName);
    }

    const params = {
      TableName: process.env.aws_TableName,
      Key: {
        PK: "BUMPERS",
        SK: bumperDetail.SK,
      },
    };
    await docClient.delete(params).promise(); //for deleting matching data from DB
  }

  return {
    status: true,
    message: message.success.BUMPER_DELETE,
    data: {},
  } as IBumpersSuccessResponse;
}

async function getAdvertiserDetails(
  brandsOfAdvertiser,
  categoryMaster,
  brandMaster,
  productMaster
) {
  let advertiserDetails = {};
  const brandArray = [];
  const categoryArray = [];
  const productArray = [];

  if (brandsOfAdvertiser.Items.length > 0) {
    for (const brandValues of brandsOfAdvertiser.Items) {
      const branId = brandValues.SK;

      //#region checking brand data is matching or not
      const filterBrand = _.filter(brandMaster, (value) => value.SK === branId);
      let brandDetail = {};
      if (filterBrand.length > 0) {
        brandDetail = filterBrand[0];
      }
      //#endregion

      const categoriesOfBrandObj = {
        TableName: process.env.aws_TableName,
        KeyConditionExpression: "#partitionKey = :PK",
        ExpressionAttributeNames: {
          "#partitionKey": "PK",
        },
        ExpressionAttributeValues: {
          ":PK": branId,
        },
      };
      const getCategoriesOfBrand = await docClient
        .query(categoriesOfBrandObj)
        .promise();

      if (getCategoriesOfBrand.Items.length > 0) {
        for (const categoryValues of getCategoriesOfBrand.Items) {
          const categoryId = categoryValues.SK;

          //#region checking category data is matching or not
          const filterCategory = _.filter(
            categoryMaster,
            (value) => value.SK === categoryId
          );
          let categoryDetail = {};
          if (filterCategory.length > 0) {
            categoryDetail = filterCategory[0];
          }
          //#endregion

          const productsOfCategoriesObj = {
            TableName: process.env.aws_TableName,
            KeyConditionExpression: "#partitionKey = :PK",
            ExpressionAttributeNames: {
              "#partitionKey": "PK",
            },
            ExpressionAttributeValues: {
              ":PK": categoryId,
            },
          };
          const getProductsOfCategory = await docClient
            .query(productsOfCategoriesObj)
            .promise();

          if (getProductsOfCategory.Items.length > 0) {
            for (const productValues of getProductsOfCategory.Items) {
              const productId = productValues.SK;

              //#region checking product data is matching or not
              const filterProduct = _.filter(
                productMaster,
                (value) => value.SK === productId
              );
              let productDetail = {};
              if (filterProduct.length > 0) {
                productDetail = filterProduct[0];
              }
              //#endregion

              const productObjWithCategoryId = {
                ...productDetail,
                categoryId,
              };
              productArray.push(productObjWithCategoryId);
            }
          }

          const cateObjWithBrand = {
            ...categoryDetail,
            branId,
          };

          categoryArray.push(cateObjWithBrand);
        }
      }

      brandArray.push(brandDetail);
    }
    advertiserDetails = {
      brands: brandArray,
      categories: categoryArray,
      products: productArray,
    };
    return advertiserDetails;
  }
}

async function deleteS3Object(fileName) {
  const deleteParam = {
    Bucket: `${process.env.aws_S3_BUCKET}`,
    Key: fileName,
  };
  const deleteResp = await s3.deleteObject(deleteParam).promise();
  return deleteResp;
}
