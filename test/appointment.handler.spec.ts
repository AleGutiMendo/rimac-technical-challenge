import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handler } from '../src/lambdas/handlers/appointment.handler';

jest.mock('../src/infrastructure/services/dynamodb.service');
jest.mock('../src/infrastructure/services/sns.service');
jest.mock('../src/lambdas/shared/bootstrap', () => ({
  ensureBootstrap: jest.fn(),
}));

describe('appointment.handler', () => {
  const context = {} as Context;
  const callback = jest.fn();

  it('debe crear un appointment correctamente (happy path)', async () => {
    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({
        insuredId: '12345',
        scheduleId: 2,
        countryISO: 'PE',
      }),
    } as any;
    const result = await handler(event, context, callback);
    expect(result && (result as any).statusCode).toBe(200);
  });

  it('debe retornar error si el body es inválido', async () => {
    const event: APIGatewayProxyEvent = { body: 'no-json' } as any;
    const result = await handler(event, context, callback);
    expect(result && (result as any).statusCode).toBe(400);
  });

  it('debe retornar error si falta el body', async () => {
    const event: APIGatewayProxyEvent = {} as any;
    const result = await handler(event, context, callback);
    expect(result && (result as any).statusCode).toBe(400);
  });
});
