import { Context, SQSEvent } from 'aws-lambda';
import { handler } from '../src/lambdas/handlers/appointment-pe.handler';

jest.mock('../src/infrastructure/services/rds.service');
jest.mock('../src/infrastructure/services/eventbridge.service');
jest.mock('../src/lambdas/shared/bootstrap', () => ({
  ensureBootstrap: jest.fn(),
}));

const buildSQSEvent = (message: any) =>
  ({
    Records: [
      {
        body: JSON.stringify({ Message: JSON.stringify(message) }),
        messageId: 'msg-1',
      },
    ],
  }) as SQSEvent;

describe('appointment-pe.handler', () => {
  const context = {} as Context;
  const callback = jest.fn();

  it('debe procesar un appointment de Perú correctamente (happy path)', async () => {
    const event = buildSQSEvent({ appointmentId: '123', countryISO: 'PE' });
    await expect(handler(event, context, callback)).resolves.toBeUndefined();
  });

  it('debe continuar si hay error en un record', async () => {
    const event = buildSQSEvent('no-json');
    await expect(handler(event, context, callback)).resolves.toBeUndefined();
  });
});
