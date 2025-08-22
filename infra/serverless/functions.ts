import type { AWS } from '@serverless/typescript';

export const functions: AWS['functions'] = {
  appointment: {
    handler: 'src/lambdas/handlers/appointment.handler.ts',
    timeout: 30,
    memorySize: 512,
    layers: [{ Ref: 'AwsSdkLambdaLayer' }],
    events: [
      {
        http: {
          method: 'post',
          path: '/api/appointments',
          cors: true,
        },
      },
    ],
  },
  listAppointments: {
    handler: 'src/lambdas/handlers/list-appointments.handler.ts',
    timeout: 30,
    memorySize: 256,
    layers: [{ Ref: 'AwsSdkLambdaLayer' }],
    events: [
      {
        http: {
          method: 'get',
          path: '/api/appointments/{insuredId}',
          cors: true,
        },
      },
    ],
  },
  appointmentPe: {
    handler: 'src/lambdas/handlers/appointment-pe.handler.ts',
    timeout: 30,
    memorySize: 512,
    layers: [{ Ref: 'AwsSdkLambdaLayer' }, { Ref: 'Mysql2LambdaLayer' }],
    events: [
      {
        sqs: {
          arn: { 'Fn::GetAtt': ['AppointmentsPeQueue', 'Arn'] },
          batchSize: 10,
        },
      },
    ],
  },
  appointmentCl: {
    handler: 'src/lambdas/handlers/appointment-cl.handler.ts',
    timeout: 30,
    memorySize: 512,
    layers: [{ Ref: 'AwsSdkLambdaLayer' }, { Ref: 'Mysql2LambdaLayer' }],
    events: [
      {
        sqs: {
          arn: { 'Fn::GetAtt': ['AppointmentsClQueue', 'Arn'] },
          batchSize: 10,
        },
      },
    ],
  },
  appointmentConfirmation: {
    handler: 'src/lambdas/handlers/appointment-confirmation.handler.ts',
    timeout: 30,
    memorySize: 256,
    layers: [{ Ref: 'AwsSdkLambdaLayer' }],
    events: [
      {
        sqs: {
          arn: { 'Fn::GetAtt': ['AppointmentsConfirmationQueue', 'Arn'] },
          batchSize: 10,
        },
      },
    ],
  },
};
