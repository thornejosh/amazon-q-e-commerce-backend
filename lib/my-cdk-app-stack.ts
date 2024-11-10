import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as nodejsLambda from 'aws-cdk-lib/aws-lambda-nodejs';

export class MyCdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB table
    const table = new dynamodb.Table(this, 'ItemsTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // Lambda function
    const itemsFunction = new nodejsLambda.NodejsFunction(this, 'ItemsHandler', {
      entry: 'lambda/items.ts',
      handler: 'handler',
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    // Grant the Lambda function read/write permissions to the DynamoDB table
    table.grantReadWriteData(itemsFunction);

    // API Gateway
    const api = new apigateway.RestApi(this, 'ItemsApi', {
      restApiName: 'Items Service',
    });

    const items = api.root.addResource('items');
    const getAllIntegration = new apigateway.LambdaIntegration(itemsFunction);
    items.addMethod('GET', getAllIntegration);
    items.addMethod('POST', getAllIntegration);

    const singleItem = items.addResource('{id}');
    const getSingleIntegration = new apigateway.LambdaIntegration(itemsFunction);
    singleItem.addMethod('GET', getSingleIntegration);
    singleItem.addMethod('PUT', getSingleIntegration);
    singleItem.addMethod('DELETE', getSingleIntegration);
  }
}
