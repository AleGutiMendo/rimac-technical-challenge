import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
  Handler,
} from 'aws-lambda';
import {
  CreateAppointmentRequestDto,
  CreateAppointmentResponseDto,
} from '../../application/dto/appointment.dto';
import { CreateAppointmentUseCase } from '../../application/use-cases/create-appointment.use-case';
import { DynamoDBService } from '../../infrastructure/services/dynamodb.service';
import { SNSService } from '../../infrastructure/services/sns.service';
import { BaseLambdaHandler } from '../shared/base-lambda.handler';
import { ensureBootstrap } from '../shared/bootstrap';

class AppointmentHandler extends BaseLambdaHandler<
  CreateAppointmentRequestDto,
  CreateAppointmentResponseDto
> {
  protected useCase: CreateAppointmentUseCase;

  constructor() {
    super();
    // Initialize use case with dependencies
    const dynamoDBService = new DynamoDBService();
    const snsService = new SNSService();
    this.useCase = new CreateAppointmentUseCase(dynamoDBService, snsService);
  }

  protected async parseInput(
    event: APIGatewayProxyEvent,
  ): Promise<CreateAppointmentRequestDto> {
    const {
      ValidationException,
    } = require('../../shared/exceptions/domain.exception');
    if (!event.body) {
      throw new ValidationException('Request body is required');
    }

    try {
      const body = JSON.parse(event.body);
      return {
        insuredId: body.insuredId,
        scheduleId: body.scheduleId,
        countryISO: body.countryISO,
      };
    } catch (error) {
      throw new ValidationException('Invalid JSON in request body');
    }
  }
}

// Lambda handler function
export const handler: Handler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  // Ensure dependencies are bootstrapped
  await ensureBootstrap();

  // Create handler instance
  const handlerInstance = new AppointmentHandler();

  // Handle the request
  return handlerInstance.handle(event, context);
};
