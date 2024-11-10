import { handler } from "../lambda/items";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { DynamoDB } from "aws-sdk";

// Mock DynamoDB
jest.mock("aws-sdk", () => ({
  DynamoDB: {
    DocumentClient: jest.fn(() => ({
      scan: jest.fn().mockReturnThis(),
      get: jest.fn().mockReturnThis(),
      put: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      promise: jest.fn(),
    })),
  },
}));

describe("Lambda function tests", () => {
  let mockDynamoDb: jest.Mocked<DynamoDB.DocumentClient>;

  beforeEach(() => {
    mockDynamoDb =
      new DynamoDB.DocumentClient() as jest.Mocked<DynamoDB.DocumentClient>;
    process.env.TABLE_NAME = "test-table";
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("GET all items", async () => {
    const mockItems = [
      { id: "1", name: "Item 1", price: 10 },
      { id: "2", name: "Item 2", price: 20 },
    ];
    const tableName = process.env.TABLE_NAME as string;
    mockDynamoDb.scan({ TableName: tableName }).promise = jest
      .fn()
      .mockResolvedValue({ Items: mockItems });

    const event = {
      httpMethod: "GET",
      pathParameters: {},
    } as unknown as APIGatewayProxyEvent;
    const result = (await handler(
      event,
      {} as Context,
      () => {}
    )) as APIGatewayProxyResult;

    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify(mockItems),
    });
  });

  test("GET single item", async () => {
    const mockItem = { id: "1", name: "Item 1", price: 10 };
    const tableName = process.env.TABLE_NAME as string;
    mockDynamoDb.get({ TableName: tableName, Key: { id: "1" } }).promise = jest
      .fn()
      .mockResolvedValue({ Item: mockItem });

    const event = {
      httpMethod: "GET",
      pathParameters: { id: "1" },
    } as unknown as APIGatewayProxyEvent;
    const result = (await handler(
      event,
      {} as Context,
      () => {}
    )) as APIGatewayProxyResult;

    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify(mockItem),
    });
  });

  test("POST new item", async () => {
    const newItem = { name: "New Item", price: 15 };
    const tableName = process.env.TABLE_NAME as string;
    mockDynamoDb.put({
      TableName: tableName,
      Item: expect.any(Object),
    }).promise = jest.fn().mockResolvedValue({});

    const event = {
      httpMethod: "POST",
      body: JSON.stringify(newItem),
    } as unknown as APIGatewayProxyEvent;
    const result = (await handler(
      event,
      {} as Context,
      () => {}
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(201);
    expect(JSON.parse(result.body as string)).toMatchObject(newItem);
  });

  test("PUT update item", async () => {
    const updatedItem = { name: "Updated Item", price: 25 };
    mockDynamoDb.update({
      TableName: process.env.TABLE_NAME!,
      Key: { id: "1" },
      UpdateExpression: expect.any(String),
      ExpressionAttributeValues: expect.any(Object),
    }).promise = jest.fn().mockResolvedValue({});

    const event = {
      httpMethod: "PUT",
      pathParameters: { id: "1" },
      body: JSON.stringify(updatedItem),
    } as unknown as APIGatewayProxyEvent;
    const result = (await handler(
      event,
      {} as Context,
      () => {}
    )) as APIGatewayProxyResult;

    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({ id: "1", ...updatedItem }),
    });
  });

  test("DELETE item", async () => {
    mockDynamoDb.delete({
      TableName: process.env.TABLE_NAME!,
      Key: { id: "1" },
    }).promise = jest.fn().mockResolvedValue({});

    const event = {
      httpMethod: "DELETE",
      pathParameters: { id: "1" },
    } as unknown as APIGatewayProxyEvent;
    const result = (await handler(
      event,
      {} as Context,
      () => {}
    )) as APIGatewayProxyResult;

    expect(result).toEqual({
      statusCode: 204,
      body: "",
    });
  });

  test("Invalid HTTP method", async () => {
    const event = {
      httpMethod: "INVALID",
      pathParameters: {},
    } as unknown as APIGatewayProxyEvent;
    const result = (await handler(
      event,
      {} as Context,
      () => {}
    )) as APIGatewayProxyResult;

    expect(result).toEqual({
      statusCode: 405,
      body: JSON.stringify({ message: "Method not allowed" }),
    });
  });

  test("POST with invalid input", async () => {
    const invalidItem = { invalid: "data" };
    const event = {
      httpMethod: "POST",
      body: JSON.stringify(invalidItem),
    } as unknown as APIGatewayProxyEvent;
    const result = (await handler(event, {} as Context, () => {})) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body as string)).toEqual({
      message: "Missing required fields: name and price",
    });
  });

  test("PUT with missing id", async () => {
    const updatedItem = { name: "Updated Item", price: 25 };
    const event = {
      httpMethod: "PUT",
      body: JSON.stringify(updatedItem),
    } as unknown as APIGatewayProxyEvent;
    const result = (await handler(event, {} as Context, () => {})) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body as string)).toEqual({
      message: "Missing item id",
    });
  });

  test("GET non-existent item", async () => {
    mockDynamoDb.get({
      TableName: process.env.TABLE_NAME as string,
      Key: { id: "non-existent" },
    }).promise = jest.fn().mockResolvedValue({});

    const event = {
      httpMethod: "GET",
      pathParameters: { id: "non-existent" },
    } as unknown as APIGatewayProxyEvent;
    const result = await handler(event, {} as Context, () => {});

    expect(result).toEqual({
      statusCode: 404,
      body: JSON.stringify({ message: "Item not found" }),
    });
  });
});
