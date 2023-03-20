# NOTES: Serveless Project 01

## Plugins

| Plugin            | Links                                                                                        |
| ----------------- | -------------------------------------------------------------------------------------------- |
| Serverless        | [https://www.serverless.com/framework/docs/getting-started][pldb]                            |
|                   | [https://www.npmjs.com/package/serverless][pldb]                                             |
| serverless-bundle | [https://github.com/AnomalyInnovations/serverless-bundle][pldb]                              |
|                   | [https://www.npmjs.com/package/serverless-bundle][pldb]                                      |
| uuid              | [https://www.npmjs.com/package/uuid][pldb]                                                   |
| DynamoDB Docs     | [https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html][pldb] |
| Middy Middleware  | [https://github.com/middyjs/middy][pldb]                                                     |

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
