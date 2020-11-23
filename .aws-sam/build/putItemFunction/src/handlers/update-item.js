// Create clients and set shared const values outside of the handler.

// Get the DynamoDB table name from environment variables
const tableName = process.env.SAMPLE_TABLE;

// Create a DocumentClient that represents the query to add an item
const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

/**
 * A simple example includes a HTTP get method to get one item by id from a DynamoDB table.
 */
exports.updateItemHandler = async (event) => {
  if (event.httpMethod !== 'POST') {
    throw new Error(`getMethod only accept POST method, you tried: ${event.httpMethod}`);
  }
  // All log statements are written to CloudWatch
  console.info('received:', event);
 

  // Get id and name from the body of the request
  const body = JSON.parse(event.body)
  const id = body.id;
  const street = body.street;
  const county = body.county;
  const postcode = body.postcode;

  // Get the item from the table
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#get-property
  var params = {
    TableName : tableName,
    Key: { id : id },
    UpdateExpression: 'set street=:street, county=:county, postcode=:postcode',
    ExpressionAttributeValues: {
      ':street': street,
      ':county': county,
      ':postcode': postcode
    },
    ReturnValues: "UPDATED_NEW"
  };
  const data = await docClient.update(params).promise();
  const item = data.Item;
 
  const response = {
    statusCode: 200,
    body: JSON.stringify(item)
  };
 
  // All log statements are written to CloudWatch
  console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
  return response;
}
