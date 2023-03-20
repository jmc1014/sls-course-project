# NOTES: Serveless Project 01

## Plugins

| Plugin            | Links                                                             |
| ----------------- | ----------------------------------------------------------------- |
| Serverless        | [https://www.serverless.com/framework/docs/getting-started][pldb] |
|                   | [https://www.npmjs.com/package/serverless][pldb]                  |
| serverless-bundle | [https://github.com/AnomalyInnovations/serverless-bundle][pldb]   |
|                   | [https://www.npmjs.com/package/serverless-bundle][pldb]           |

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
