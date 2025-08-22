export const provider = {
  name: 'aws' as const,
  runtime: 'nodejs18.x' as const,
  region: '${opt:region, "us-east-1"}',
  stage: '${opt:stage, "dev"}',
  timeout: 30,
  memorySize: 512,
  profile: process.env.AWS_PROFILE || 'ale-gutimendo-dev',
  environment: {
    NODE_ENV: '${self:provider.stage}',
    PROJECT_PREFIX: '${env:PROJECT_PREFIX, "rimac-challenge"}',
    STAGE: '${self:provider.stage}',
    APPOINTMENTS_TABLE: '${self:service}-appointments',
    APPOINTMENTS_TOPIC_ARN: { Ref: 'AppointmentsTopic' },
    APPOINTMENTS_EVENT_BUS_NAME: '${self:service}-appointments-events',
    RDS_HOST: '${env:RDS_HOST, "localhost"}',
    RDS_PORT: '${env:RDS_PORT, "3306"}',
    RDS_DATABASE: '${env:RDS_DATABASE, "appointments"}',
    RDS_USERNAME: '${env:RDS_USERNAME, "admin"}',
    RDS_PASSWORD: '${env:RDS_PASSWORD, "password"}',
  },
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: [
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:PutLogEvents',
      ],
      Resource: 'arn:aws:logs:*:*:*',
    },
    {
      Effect: 'Allow',
      Action: [
        'dynamodb:Query',
        'dynamodb:Scan',
        'dynamodb:GetItem',
        'dynamodb:PutItem',
        'dynamodb:UpdateItem',
        'dynamodb:DeleteItem',
      ],
      Resource:
        'arn:aws:dynamodb:${self:provider.region}:*:table/${self:service}-*',
    },
    {
      Effect: 'Allow',
      Action: ['sns:Publish'],
      Resource: '*',
    },
    {
      Effect: 'Allow',
      Action: [
        'sqs:SendMessage',
        'sqs:ReceiveMessage',
        'sqs:DeleteMessage',
        'sqs:GetQueueAttributes',
      ],
      Resource: '*',
    },
    {
      Effect: 'Allow',
      Action: ['events:PutEvents'],
      Resource:
        'arn:aws:events:${self:provider.region}:*:event-bus/${self:service}-appointments-events',
    },
  ],
};
