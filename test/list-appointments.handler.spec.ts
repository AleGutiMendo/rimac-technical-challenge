import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { handler } from '../src/lambdas/handlers/list-appointments.handler';

jest.mock('../src/infrastructure/services/dynamodb.service');
jest.mock('../src/lambdas/shared/bootstrap', () => ({
  ensureBootstrap: jest.fn(),
}));

describe('list-appointments.handler', () => {
  const context = {} as Context;
  const callback = jest.fn();

  beforeAll(() => {
    const DynamoDBService =
      require('../src/infrastructure/services/dynamodb.service').DynamoDBService;
    DynamoDBService.prototype.getAppointmentsByInsuredId = jest
      .fn()
      .mockResolvedValue([]);
  });

  it('debe listar appointments correctamente (happy path)', async () => {
    const event: APIGatewayProxyEvent = {
      pathParameters: { insuredId: '12345' },
    } as any;
    const result = await handler(event, context, callback);
    expect(result && (result as APIGatewayProxyResult).statusCode).toBe(200);
  });

  it('debe retornar error si falta insuredId en pathParameters', async () => {
    const event: APIGatewayProxyEvent = { pathParameters: {} } as any;
    const result = await handler(event, context, callback);
    expect(result && (result as APIGatewayProxyResult).statusCode).toBe(400);
  });
});
