# CDK TypeScript Project: Items API

This project implements a serverless API for managing items using AWS CDK, Lambda, DynamoDB, and API Gateway.

## Project Structure

- `lib/my-cdk-app-stack.ts`: Contains the CDK stack definition
- `lambda/items.ts`: Lambda function handling CRUD operations for items
- `test/lambda.test.ts`: Unit tests for the Lambda function
- `test/api.test.ts`: Integration tests for the API

## Setup and Deployment

1. Install dependencies:
   ```
   npm install
   ```

2. Build the project:
   ```
   npm run build
   ```

3. Deploy the stack:
   ```
   npx cdk deploy
   ```

## Running Tests

To run both unit and integration tests with coverage:

```
npm test
```

### Unit Tests

Unit tests cover the Lambda function's behavior for all CRUD operations and error cases. They use mocked DynamoDB calls to isolate the function's logic.

To run only unit tests:

```
npx jest test/lambda.test.ts
```

### Integration Tests

Integration tests interact with the deployed API to ensure end-to-end functionality. They cover all CRUD operations and error cases.

To run only integration tests:

```
npx jest test/api.test.ts
```

**Note:** Make sure to update the `API_ENDPOINT` in `test/api.test.ts` with your deployed API's URL before running integration tests.

## Useful Commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
