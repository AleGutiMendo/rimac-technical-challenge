import type { AWS } from '@serverless/typescript';
import { createApiFunction } from '../../infra/templates/function-builder';

export const functions: AWS['functions'] = {
  appointment: {
    ...createApiFunction(
      'appointment',
      'src/lambdas/handlers/appointment.handler',
    )
      .withTimeout(30)
      .withMemorySize(512)
      .withHttpEvent('post', '/api/appointments')
      .build(),
    layers: [{ Ref: 'AwsSdkLambdaLayer' }, { Ref: 'Mysql2LambdaLayer' }],
  },
  listAppointments: {
    ...createApiFunction(
      'listAppointments',
      'src/lambdas/handlers/list-appointments.handler',
    )
      .withTimeout(30)
      .withMemorySize(256)
      .withHttpEvent('get', '/api/appointments/{insuredId}')
      .build(),
    layers: [{ Ref: 'AwsSdkLambdaLayer' }, { Ref: 'Mysql2LambdaLayer' }],
  },
  appointmentPe: {
    handler: 'src/lambdas/handlers/appointment-pe.handler',
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
    handler: 'src/lambdas/handlers/appointment-cl.handler',
    timeout: 30,
    memorySize: 512,
    layers: [{ Ref: 'AwsSdkLambdaLayer' }],
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
    handler: 'src/lambdas/handlers/appointment-confirmation.handler',
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
