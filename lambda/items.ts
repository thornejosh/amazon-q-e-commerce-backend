import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

const dynamoDB = new DynamoDB.DocumentClient();
const tableName = process.env.TABLE_NAME!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    switch (event.httpMethod) {
      case 'GET':
        if (event.pathParameters && event.pathParameters.id) {
          return await getItem(event.pathParameters.id);
        }
        return await getAllItems();
      case 'POST':
        if (!event.body) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Missing request body' }),
          };
        }
        return await createItem(JSON.parse(event.body));
      case 'PUT':
        if (!event.body) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Missing request body' }),
          };
        }
        return await updateItem(event.pathParameters?.id, JSON.parse(event.body));
      case 'DELETE':
        return await deleteItem(event.pathParameters?.id);
      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ message: 'Method not allowed' }),
        };
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};

async function getAllItems() {
  const result = await dynamoDB.scan({ TableName: tableName }).promise();
  return {
    statusCode: 200,
    body: JSON.stringify(result.Items),
  };
}

async function getItem(id: string) {
  const result = await dynamoDB.get({
    TableName: tableName,
    Key: { id },
  }).promise();

  if (result.Item) {
    return {
      statusCode: 200,
      body: JSON.stringify(result.Item),
    };
  } else {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'Item not found' }),
    };
  }
}

async function createItem(item: any) {
  if (!item.name || !item.price) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing required fields: name and price' }),
    };
  }

  const id = Date.now().toString();
  await dynamoDB.put({
    TableName: tableName,
    Item: { id, ...item },
  }).promise();

  return {
    statusCode: 201,
    body: JSON.stringify({ id, ...item }),
  };
}

async function updateItem(id: string | undefined, item: any) {
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing item id' }),
    };
  }

  if (!item.name && !item.price) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing fields to update: name or price' }),
    };
  }

  const updateExpression = [];
  const expressionAttributeNames: { [key: string]: string } = {};
  const expressionAttributeValues: { [key: string]: any } = {};

  if (item.name) {
    updateExpression.push('#name = :name');
    expressionAttributeNames['#name'] = 'name';
    expressionAttributeValues[':name'] = item.name;
  }

  if (item.price) {
    updateExpression.push('price = :price');
    expressionAttributeValues[':price'] = item.price;
  }

  await dynamoDB.update({
    TableName: tableName,
    Key: { id },
    UpdateExpression: `set ${updateExpression.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
  }).promise();

  return {
    statusCode: 200,
    body: JSON.stringify({ id, ...item }),
  };
}

async function deleteItem(id: string | undefined) {
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing item id' }),
    };
  }

  await dynamoDB.delete({
    TableName: tableName,
    Key: { id },
  }).promise();

  return {
    statusCode: 204,
    body: '',
  };
}