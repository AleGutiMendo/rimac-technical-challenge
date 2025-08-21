// Definición de outputs de CloudFormation para Serverless Framework
export const outputs = {
  AppointmentsTopicArn: {
    Value: { Ref: 'AppointmentsTopic' },
  },
  AppointmentsPeQueueUrl: {
    Value: { Ref: 'AppointmentsPeQueue' },
  },
  AppointmentsPeQueueArn: {
    Value: { 'Fn::GetAtt': ['AppointmentsPeQueue', 'Arn'] },
  },
  AppointmentsClQueueUrl: {
    Value: { Ref: 'AppointmentsClQueue' },
  },
  AppointmentsClQueueArn: {
    Value: { 'Fn::GetAtt': ['AppointmentsClQueue', 'Arn'] },
  },
  AppointmentsConfirmationQueueUrl: {
    Value: { Ref: 'AppointmentsConfirmationQueue' },
  },
  AppointmentsConfirmationQueueArn: {
    Value: { 'Fn::GetAtt': ['AppointmentsConfirmationQueue', 'Arn'] },
  },
  SwaggerDocsBucketName: {
    Value: { Ref: 'SwaggerDocsBucket' },
  },
  SwaggerDocsWebsiteURL: {
    Value: { 'Fn::GetAtt': ['SwaggerDocsBucket', 'WebsiteURL'] },
  },
};
