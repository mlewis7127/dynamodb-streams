// Create a DocumentClient that represents the query to add an item
const AWS = require('aws-sdk');
const dynamodbStreams = new AWS.DynamoDBStreams();


exports.lambda_handler = async (event, context) => {
    console.log('In the get-dlq-message handler');
    console.log(JSON.stringify(event, null, 2));

    for(const record of event.Records) {
      const { body } = record;
      const msg = JSON.parse(body);
      const ShardId =  msg.DDBStreamBatchInfo.shardId;
      const StreamArn =  msg.DDBStreamBatchInfo.streamArn;
      const SequenceNumber =  msg.DDBStreamBatchInfo.startSequenceNumber;

      try {
        const iterator = await getShardIterator(ShardId, StreamArn, SequenceNumber);
        const records = await dynamodbStreams.getRecords(iterator).promise();

        records.Records.forEach(message => { 
          const messageData = JSON.stringify(message.dynamodb);
          console.log(`messageData: ${messageData}`);
        });

      } catch(err) {
        console.log(`Error: " ${err}`);
      }

    }
};

async function getShardIterator(ShardId, StreamArn, SequenceNumber) {
  const params = {
    ShardId,
    ShardIteratorType: "AT_SEQUENCE_NUMBER",
    StreamArn,
    SequenceNumber
  };
  return await dynamodbStreams.getShardIterator(params).promise();
}