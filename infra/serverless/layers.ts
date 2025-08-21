import type { AWS } from '@serverless/typescript';

export const layers: AWS['layers'] = {
  awsSdk: {
    path: 'layer/aws-sdk',
    name: '${self:service}-aws-sdk',
    compatibleRuntimes: ['nodejs18.x'],
    package: {
      patterns: [
        'nodejs/node_modules/@aws-sdk/client-dynamodb/dist/cjs/**/*.js',
        'nodejs/node_modules/@aws-sdk/client-eventbridge/dist/cjs/**/*.js',
        'nodejs/node_modules/@aws-sdk/client-sns/dist/cjs/**/*.js',
        'nodejs/node_modules/@aws-sdk/client-sqs/dist/cjs/**/*.js',
        'nodejs/node_modules/@aws-sdk/lib-dynamodb/dist/cjs/**/*.js',
        'nodejs/node_modules/joi/lib/**/*.js',
        'nodejs/node_modules/@aws-sdk/client-dynamodb/package.json',
        'nodejs/node_modules/@aws-sdk/client-eventbridge/package.json',
        'nodejs/node_modules/@aws-sdk/client-sns/package.json',
        'nodejs/node_modules/@aws-sdk/client-sqs/package.json',
        'nodejs/node_modules/@aws-sdk/lib-dynamodb/package.json',
        'nodejs/node_modules/joi/package.json',
      ],
    },
  },
  mysql2: {
    path: 'layer/mysql2',
    name: '${self:service}-mysql2',
    compatibleRuntimes: ['nodejs18.x'],
    package: {
      patterns: ['nodejs/node_modules/mysql2/**'],
    },
  },
};
