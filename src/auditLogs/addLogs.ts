import AWS from 'aws-sdk';

const awsConfig = {
    "region" : process.env.aws_region,
    "endpoint" : process.env.aws_endpoint,
    "accessKeyId" : process.env.aws_accessKeyId,
    "secretAccessKey" : process.env.aws_secretAccessKey
};
AWS.config.update(awsConfig);

const docClient = new AWS.DynamoDB.DocumentClient();

export default async function postLogDetail(logDetail) {
    let newData = logDetail.objNewData

    const eventChanges = {};

    if(Object.keys(newData).length > 0){
        let oldData = logDetail.objOldData

        for (let i = 0; i < Object.keys(newData).length; i++) {

            let field = Object.keys(newData)[i];
      
            let newFieldValue = Object.values(newData)[i];
      
            let oldFieldValue
      
            console.log(newFieldValue, 'newFieldValue');
      
      
      
            if (Object.keys(oldData).length > 0) {
      
              for (let j = 0; j < Object.keys(oldData).length; j++) {
      
                if (field === Object.keys(oldData)[j]) {
      
                  oldFieldValue = Object.values(oldData)[j];
      
                }
      
              }
      
            }
      
      
      
            // let objEventChangeItem = {
      
            //   fieldName: field,
      
            //   oldValue: oldFieldValue,
      
            //   newValue: newFieldValue
      
            // };
      
            eventChanges[field] = {
                oldValue : oldFieldValue,
                newValue : newFieldValue,
            };
      
        }
    }

    delete logDetail.objOldData;

    delete logDetail.objNewData;

    let objLogDetail = { ...logDetail, eventChanges: eventChanges };

    // console.log(objLogDetail, 'objLogDetail')
    const logAddParam = {
        TableName: process.env.aws_AuditLogTable,
        Item: {
            ...objLogDetail,
            PK : logDetail.entity,
            SK : new Date().toUTCString()
        }
    };
    const response = await docClient.put(logAddParam).promise(); //for adding data to DB

    if (response) {

        return true;

    } else {

        return false;

    }
}