import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
  Handler,
} from 'aws-lambda';
import { ListAppointmentsResponseDto } from '../../application/dto/appointment.dto';
import {
  ListAppointmentsInputDto,
  ListAppointmentsUseCase,
} from '../../application/use-cases/list-appointments.use-case';
import { DynamoDBService } from '../../infrastructure/services/dynamodb.service';
import { BaseLambdaHandler } from '../shared/base-lambda.handler';
import { ensureBootstrap } from '../shared/bootstrap';

class ListAppointmentsHandler extends BaseLambdaHandler<
  ListAppointmentsInputDto,
  ListAppointmentsResponseDto
> {
  protected useCase: ListAppointmentsUseCase;

  constructor() {
    super();
    // Initialize use case with dependencies
    const dynamoDBService = new DynamoDBService();
    this.useCase = new ListAppointmentsUseCase(dynamoDBService);
  }

  protected async parseInput(
    event: APIGatewayProxyEvent,
  ): Promise<ListAppointmentsInputDto> {
    const {
      ValidationException,
    } = require('../../shared/exceptions/domain.exception');
    const insuredId = event.pathParameters?.insuredId;
    if (!insuredId) {
      throw new ValidationException('InsuredId is required in path parameters');
    }
    return {
      insuredId,
    };
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
  const handlerInstance = new ListAppointmentsHandler();

  // Handle the request
  return handlerInstance.handle(event, context);
};
