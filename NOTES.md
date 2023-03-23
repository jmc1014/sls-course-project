# NOTES: Serveless Project 01

Current Node Version: node 16.15.1 to 14.21.3

## Plugins

| Plugin            | Links                                                                                |
| ----------------- | ------------------------------------------------------------------------------------ |
| Serverless        | https://www.serverless.com/framework/docs/getting-started                            |
|                   | https://www.npmjs.com/package/serverless                                             |
| serverless-bundle | https://github.com/AnomalyInnovations/serverless-bundle                              |
|                   | https://www.npmjs.com/package/serverless-bundle                                      |
| uuid              | https://www.npmjs.com/package/uuid                                                   |
| DynamoDB Docs     | https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html |
| Middy Middleware  | https://github.com/middyjs/middy                                                     |
| Auth0             | https://auth0.com/                                                                   |
| JWT               | https://jwt.io/                                                                      |
| Amazon SQS        | https://docs.aws.amazon.com/sqs/                                                     |

## Getting started

```
sls create --name YOUR_PROJECT_NAME --template-url https://github.com/codingly-io/sls-base
cd YOUR_PROJECT_NAME
```

#### Updated the Pacakges

1. Install the tool `npm install -g npm-check-updates`
1. Update the package.json `ncu --upgrade`
1. Install the new packages `npm install`

#### Deploy Serveless Service

```
sls deploy
or
sls deploy --verbose
```

#### Deploy Serveless Service (stack)

```
sls remove
```

#### Deploy Serveless specific function

use this if createAuction.js is only changes for easy deploypment

```
sls deploy -f createAuction  --verbose
```

## DynamoDB

### Info

- High Availability
- Performance
- Durability
- Schemaless
- Records presented in JSON format
- DynamoDB Streams
  - An optional deature that allows you to react on new item creation, update or deletion in your DynamoDB Table

**Components**

- Tables
- Items
- Attributes

**Query vs Scan**

Scan

- scans through each individual item in the database
- have performance implications, that should be your last resort

Query

- query based on a primary key or secondary index
- recommended way to operate at refular basis

Primary Key

- The primary key helps uniquely identify items in the table.
- **Partition key**
  - A simple primary key composed of one unique attribute
  - Sample `"id": "5cc72af2-e67e-4185-98f3-6afbdcdddc09",`
- **Composite Primary Key (partition key and sort key)**
  - Composed of two attributes. The first one being the partition key and the second being the sort key
  - partition key `"authoreId": "5cc72af2-e67e-4185-98f3-6afbdcdddc09",`
  - sort key `"createdAt": "2023-03-21T03:46:05.545Z",`
  - Cannot run query on sort key alone

Secondary Indexes

- can specify other keys apart from those you already defined as primary when you first created the table
- can create one or more secondary indexes for a table.
- **Global Secondary Index**
  - An index with a partition key and sort key that can be different from those on the table
  - can be specified on keys different from those that are defined as primary
  - up to 20 global indexes per table
- **Local Secondary Index**
  - An index that has the same partition key as the table, but a different sort key

**Read Consistency**

- **Eventual Consistent Reads**
  - The response might not reflect the results of a recently completed write operation.
- **Strongly Consistent Reads**
  - The response will reflect the most up-to-date data.
  - might not be available due to network delay or outage
  - potential highter latency
  - Not supported on Global Secondary Indexes
  - Use more throughput capacity, which could cost more monet

**Read/Write Capacity Modes**

- **On-Demand Mode**
  - Flexible Mode
  - Capable of serving thousands of requests per second.
  - No need to plan your capacity ahead of time.
  - Pay-per-requests - only pay for what you use.
  - Elastically adapt to your workload as it changes.
  - Delivery time usually single-digit millisecond latency (SLA)
- **Provisioned Mode**
  - Read and write capacity per second needs to be specified.
  - Can specify auto-scaling rules to automatically adjust the capacity.
  - Allows you to reserve capacity in advance, reducing the costs significantly
  - Capacity is specified as Read Capacity Units(RCU) and Write Capacity Units.
    - RCU: One RCU represents one strong consistent read per second, or two eventually consistent reads per second, for up to 4kb in size.
    - WCU: One WCU represents one write per second, for an item up to 1KB in size

### serverless.yml

```
resources:
  Resources:
    AuctionsTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: AuctionsTable
        BillingMode: PAY_PER_REQUEST
        AttributeDefinitions:
          - AttributeName: id
            AttributeType: S
        KeySchema:
          - AttributeName: id
            KeyType: HASH
```

Each services have IAM role user it need to change the permission

#### Verify the permision

- CloudFormation -> Stacks -> [Stack Name] -> Resources Tab -> Search 'iam'
- Look for 'IamRoleLambdaExecution' Click the 'Physicla ID'
- Attach Policy (did not teach because it is a IaaC)

#### Add permision to IAM role

- Go To DynamoDB
- Tables -> [Table Name] -> Overview Tab
- Find "Amazon Resource Name (ARN)" copy it
- Replace the AWS Region and AWS Account ID to make it dynamic
- Modify the 'provider' section

```
provider:
  name: aws
  ...
  iam:
    role:
      statements:
        - Effect: 'Allow'
          Action:
            - dynamodb:PutItem
          Resource:
            - arn:aws:dynamodb:${aws:region}:${aws:accountId}:table/AuctionsTable
```

- Do `sls deploy --verbose`
- Test it in Postman
- Verify it in DynamoDB -> Tables -> Items or Explore Items

## Middy Middleware

Currently there is a bug on the latest version of middy(^4.2.7) the recommendation is use the 2.5.7 version.

```
npm install @middy/core@2.5.7 @middy/http-error-handler@2.5.7 @middy/http-event-normalizer@2.5.7 @middy/http-json-body-parser@2.5.7 @middy/validator@2.5.7

```

## Scheduler

##### serverless.yml

```
processAuction:
  handler: src/handlers/processAuction.handler
  events:
    - schedule: rate(1 minute)
```

After it deploy check it in Amazon EventBridge

- Amazon EventBridge
- Rules

#### View the logs

For List all the logs

```
 sls logs -f processAuction
```

For Tailing the logs (-t)

```
 sls logs -f processAuction -t
```

For 1 minute/hour ago (--startTime 1m/1h)

```
 sls logs -f processAuction --startTime  1m
```

For invoking to view the logs on local or for testing purpose

```
 sls invoke -f processAuction -l
```

## Auth0

1. Signin
1. Create Application
1. Setting
1. Allowed Callback URLs - http://localhost:3000
1. Allowed Logout URLs - http://localhost:3000
1. Allowed Web Origins - http://localhost:3000
1. Advance Settings
1. Grant Types - Tick Password
1. Default Directory - Username-Password-Authentication

**In Postman**

- YOUR_AUTH0_DOMAIN: Application -> Settings -> Domain
- YOUR_AUTH0_CLIENT_ID : Application -> Settings -> Client ID
- YOUR_AUTH0_IDENTIFIER: Application -> APIs -> Auth0 Management API -> Identifier

```
  curl --location --request POST 'https://YOUR_AUTH0_DOMAIN/oauth/token' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'client_id=YOUR_AUTH0_CLIENT_ID' \
  --data-urlencode 'username=YOUR_USERNAME' \
  --data-urlencode 'password=YOUR_PASSWORD' \
  --data-urlencode 'grant_type=password' \
  --data-urlencode 'scope=openid' \
  --data-urlencode 'audience=YOUR_AUTH0_IDENTIFIER'
```

**On Postman - Test Script**

```
var data = JSON.parse(responseBody);
postman.setEnvironmentVariable("token", data.id_token);

console.log('data', data.id_token);
pm.test("Status code is 200", function () {
    console.log('200', postman.getEnvironmentVariable("AUTH_TOKEN"));
    pm.response.to.have.status(200);
});
```

**Get Certificate - for auth sls**
Applications -> Advanced Settings -> Certificates
Copy and Paste it in `secret.pem`

**Bug on deplyoment**

```
CREATE_FAILED: PublicEndpointLambdaFunction (AWS::Lambda::Function)
Resource handler returned message: "Uploaded file must be a non-empty zip
```

the fix is to downgrade my node version to v14.21.3 https://nodejs.org/dist/latest-v14.x
then npm install to update the packages. Node v19.8.1 does not work.

**Secure Service using Authorizer**

- CloudForamtion -> Stack -> auth-services-dev(stack) -> Resources Tab
- Search "LambdaFunction" -> CLick Physical ID -> Copy the ARN
- Paste it in Serveless.ytml functions on authorizer

```
functions:
  createAuction:
    handler: src/handlers/createAuction.handler
    events:
      - http:
          method: POST
          path: /auction
          authorizer: YOUR_ARN_CODE
```

## Amazon SES

Place all new accounts in the Amazon SES sandbox
following restrictions to your account on sandbox mode

- You can only send mail to verified email addresses and domains, or to the Amazon SES mailbox simulator.
- You can send a maximum of 200 messages per 24-hour period.
- You can send a maximum of 1 message per second.
- For sending authorization, neither you nor the delegate sender can send email to non-verified email addresses.
- For account-level suppression, bulk actions and SES API calls related to suppression list management are disabled.

Add the email to send and verified it.

**To manual trigge the function**

```
sls invoke -f sendMail -l
```

```
import AWS from "aws-sdk";

const ses = new AWS.SES({ region: "ap-southeast-1" });

async function sendMail(event, context) {
  const params = {
    Source: "sender@test.com", // Email that registered & verified in Amazon SES
    Destination: {
      ToAddresses: ["receipeint@test.com"],
    },
    Message: {
      Body: {
        Text: {
          Data: "Hello from Coding James",
        },
      },
      Subject: {
        Data: "Test Mail Subject",
      },
    },
  };

  try {
    const result = await ses.sendEmail(params).promise();
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
  }
}

export const handler = sendMail;
```

**View logs**

```
sls logs -f sendMail -t
```

## Amazon SQS (Simple Message Queue)

#### Benefits

- **Security:** granular control over who can send and receive messages. Messages can be encrypted durability.
- **Durability:** Amazon SQS stores messages on multiple servers.
- **Availability:** Highly concurrent access to messages and high availability for message production and consumption.
- **Scalability:** SQS auto-scales to handle any load increase or spike without any instructions needed from your side.
- **Reliability:** Messages can reliably be sent by multiple producers and multiple consumers at the same time.
- **Customization:** Can set default delays, retention period, variable message sizes, message splitting and etc..

#### Que Types

**Standar Queue**

- ofers maximu throuhput
- At-least-once delivery
- Best-effort ordering

**FIFO Queue(First In, Firt Out)**

- First-in-first-out(guarante order)
- Messages processed exactly once
- Limited throughput

#### Dead Letter Queue

a dead letter qeue is just a standard SQS. Qeue But it just serves a different purpose.

#### SQS Pricing

- Pay based on your usage. No minimum fee.
- First 1 million monthly request are free
