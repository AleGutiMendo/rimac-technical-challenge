import { Context, SQSEvent } from 'aws-lambda';
import { handler } from '../src/lambdas/handlers/appointment-confirmation.handler';

jest.mock('../src/infrastructure/services/dynamodb.service');
jest.mock('../src/lambdas/shared/bootstrap', () => ({
  ensureBootstrap: jest.fn(),
}));

const buildSQSEvent = (message: any) =>
  ({
    Records: [
      {
        body: JSON.stringify({ detail: JSON.stringify(message) }),
        messageId: 'msg-1',
      },
    ],
  }) as SQSEvent;

describe('appointment-confirmation.handler', () => {
  const context = {} as Context;
  const callback = jest.fn();

  it('debe procesar una confirmación correctamente (happy path)', async () => {
    const event = buildSQSEvent({ appointmentId: '123', status: 'CONFIRMED' });
    await expect(handler(event, context, callback)).resolves.toBeUndefined();
  });

  it('debe continuar si hay error en un record', async () => {
    const event = buildSQSEvent('no-json');
    await expect(handler(event, context, callback)).resolves.toBeUndefined();
  });
});
