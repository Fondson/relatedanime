const {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  ScanCommand,
} = require('@aws-sdk/client-dynamodb')

const TABLE_NAME = process.env.AWS_DYNAMODB_TABLE_NAME
let ddbClient = null

const getDdbClient = () => {
  if (ddbClient == null) {
    ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION })
  }
  return ddbClient
}

const setMalCachePath = async (path, page) => {
  const client = getDdbClient()
  console.log('MAL cache DynamoDB setting ' + path)
  await client.send(
    new PutItemCommand({
      TableName: TABLE_NAME,
      Item: {
        path: { S: path },
        page: { S: page },
      },
    }),
  )
}

const getMalCachePath = async (path) => {
  const client = getDdbClient()
  try {
    return await client.send(
      new GetItemCommand({
        TableName: TABLE_NAME,
        Key: {
          path: { S: path },
        },
        ProjectionExpression: 'page',
      }),
    )
  } catch (e) {
    console.error('MAL cache DynamoDB error:', e)
    return undefined
  }
}

const scanTable = async (paginationKey = undefined) => {
  const client = getDdbClient()
  return await client.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      ProjectionExpression: '#p',
      ExpressionAttributeNames: { '#p': 'path' },

      ExclusiveStartKey: paginationKey,
    }),
  )
}

module.exports = { setMalCachePath, getMalCachePath, scanTable }
