// Configuración de recursos CloudFormation para Serverless Framework
export const resources = {
  AppointmentsTable: {
    Type: 'AWS::DynamoDB::Table',
    Properties: {
      TableName: '${self:service}-appointments',
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' },
        { AttributeName: 'insuredId', AttributeType: 'S' },
        { AttributeName: 'status', AttributeType: 'S' },
      ],
      KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'insuredId-index',
          KeySchema: [{ AttributeName: 'insuredId', KeyType: 'HASH' }],
          Projection: { ProjectionType: 'ALL' },
        },
        {
          IndexName: 'status-index',
          KeySchema: [{ AttributeName: 'status', KeyType: 'HASH' }],
          Projection: { ProjectionType: 'ALL' },
        },
      ],
      BillingMode: 'PAY_PER_REQUEST',
    },
  },
  AppointmentsTopic: {
    Type: 'AWS::SNS::Topic',
    Properties: {
      TopicName: '${self:service}-appointments',
    },
  },
  AppointmentsPeQueue: {
    Type: 'AWS::SQS::Queue',
    Properties: {
      QueueName: '${self:service}-appointments-pe',
    },
  },
  AppointmentsClQueue: {
    Type: 'AWS::SQS::Queue',
    Properties: {
      QueueName: '${self:service}-appointments-cl',
    },
  },
  AppointmentsConfirmationQueue: {
    Type: 'AWS::SQS::Queue',
    Properties: {
      QueueName: '${self:service}-appointments-confirmation',
    },
  },
  AppointmentsPeSubscription: {
    Type: 'AWS::SNS::Subscription',
    Properties: {
      Protocol: 'sqs',
      TopicArn: { Ref: 'AppointmentsTopic' },
      Endpoint: { 'Fn::GetAtt': ['AppointmentsPeQueue', 'Arn'] },
      FilterPolicy: {
        countryISO: ['PE'],
      },
    },
  },
  AppointmentsClSubscription: {
    Type: 'AWS::SNS::Subscription',
    Properties: {
      Protocol: 'sqs',
      TopicArn: { Ref: 'AppointmentsTopic' },
      Endpoint: { 'Fn::GetAtt': ['AppointmentsClQueue', 'Arn'] },
      FilterPolicy: {
        countryISO: ['CL'],
      },
    },
  },
  AppointmentsPeQueuePolicy: {
    Type: 'AWS::SQS::QueuePolicy',
    Properties: {
      Queues: [{ Ref: 'AppointmentsPeQueue' }],
      PolicyDocument: {
        Statement: [
          {
            Effect: 'Allow',
            Principal: { Service: 'sns.amazonaws.com' },
            Action: 'sqs:SendMessage',
            Resource: { 'Fn::GetAtt': ['AppointmentsPeQueue', 'Arn'] },
            Condition: {
              ArnEquals: {
                'aws:SourceArn': { Ref: 'AppointmentsTopic' },
              },
            },
          },
        ],
      },
    },
  },
  AppointmentsClQueuePolicy: {
    Type: 'AWS::SQS::QueuePolicy',
    Properties: {
      Queues: [{ Ref: 'AppointmentsClQueue' }],
      PolicyDocument: {
        Statement: [
          {
            Effect: 'Allow',
            Principal: { Service: 'sns.amazonaws.com' },
            Action: 'sqs:SendMessage',
            Resource: { 'Fn::GetAtt': ['AppointmentsClQueue', 'Arn'] },
            Condition: {
              ArnEquals: {
                'aws:SourceArn': { Ref: 'AppointmentsTopic' },
              },
            },
          },
        ],
      },
    },
  },
  AppointmentsEventBus: {
    Type: 'AWS::Events::EventBus',
    Properties: {
      Name: '${self:service}-appointments-events',
    },
  },
  AppointmentsConfirmationRule: {
    Type: 'AWS::Events::Rule',
    Properties: {
      EventBusName: { Ref: 'AppointmentsEventBus' },
      EventPattern: {
        source: ['appointments.country.processor'],
        'detail-type': ['Appointment Processed'],
      },
      Targets: [
        {
          Id: 'AppointmentsConfirmationQueueTarget',
          Arn: { 'Fn::GetAtt': ['AppointmentsConfirmationQueue', 'Arn'] },
        },
      ],
    },
  },
  AppointmentsConfirmationQueuePolicy: {
    Type: 'AWS::SQS::QueuePolicy',
    Properties: {
      Queues: [{ Ref: 'AppointmentsConfirmationQueue' }],
      PolicyDocument: {
        Statement: [
          {
            Effect: 'Allow',
            Principal: { Service: 'events.amazonaws.com' },
            Action: 'sqs:SendMessage',
            Resource: {
              'Fn::GetAtt': ['AppointmentsConfirmationQueue', 'Arn'],
            },
          },
        ],
      },
    },
  },
  SwaggerDocsBucket: {
    Type: 'AWS::S3::Bucket',
    Properties: {
      BucketName: '${self:service}-swagger-docs-${self:provider.stage}',
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: false,
        BlockPublicPolicy: false,
        IgnorePublicAcls: false,
        RestrictPublicBuckets: false,
      },
      WebsiteConfiguration: {
        IndexDocument: 'index.html',
        ErrorDocument: 'error.html',
      },
    },
  },
  SwaggerDocsBucketPolicy: {
    Type: 'AWS::S3::BucketPolicy',
    Properties: {
      Bucket: { Ref: 'SwaggerDocsBucket' },
      PolicyDocument: {
        Statement: [
          {
            Effect: 'Allow',
            Principal: '*',
            Action: 's3:GetObject',
            Resource: {
              'Fn::Join': [
                '',
                [{ 'Fn::GetAtt': ['SwaggerDocsBucket', 'Arn'] }, '/*'],
              ],
            },
          },
        ],
      },
    },
  },
};
