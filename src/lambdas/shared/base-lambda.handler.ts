import { BaseResponseDto } from '@application/dto/base-response.dto';
import { UseCase } from '@application/interfaces/use-case.interface';
import { DomainException } from '@shared/exceptions/domain.exception';
import { Logger } from '@shared/utils/logger.util';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';

export abstract class BaseLambdaHandler<TInput, TOutput> {
  protected abstract useCase: UseCase<TInput, TOutput>;
  protected logger = new Logger(this.constructor.name);

  async handle(
    event: APIGatewayProxyEvent,
    context: Context,
  ): Promise<APIGatewayProxyResult> {
    try {
      // Log request
      this.logger.info('Lambda invocation started', {
        requestId: context.awsRequestId,
        functionName: context.functionName,
        event: this.sanitizeEvent(event),
      });

      // Parse input
      const input = await this.parseInput(event);

      // Validate input
      await this.validateInput(input);

      // Execute use case
      const result = await this.useCase.execute(input);

      // Format response
      const response = this.formatSuccessResponse(result);

      this.logger.info('Lambda execution completed successfully', {
        requestId: context.awsRequestId,
      });

      return {
        statusCode: 200,
        headers: this.getHeaders(),
        body: JSON.stringify(response),
      };
    } catch (error) {
      return this.handleError(error, context);
    }
  }

  protected abstract parseInput(event: APIGatewayProxyEvent): Promise<TInput>;

  protected async validateInput(input: TInput): Promise<void> {
    // Override in subclasses for specific validation
  }

  protected formatSuccessResponse(result: TOutput): BaseResponseDto<TOutput> {
    return BaseResponseDto.success(result);
  }

  protected handleError(error: any, context: Context): APIGatewayProxyResult {
    this.logger.error('Lambda execution failed', {
      requestId: context.awsRequestId,
      error: error.message,
      stack: error.stack,
    });

    if (error instanceof DomainException) {
      return {
        statusCode: this.getHttpStatusForDomainException(error),
        headers: this.getHeaders(),
        body: JSON.stringify(BaseResponseDto.error(error.code, error.message)),
      };
    }

    // Generic error
    return {
      statusCode: 500,
      headers: this.getHeaders(),
      body: JSON.stringify(
        BaseResponseDto.error('INTERNAL_ERROR', 'An unexpected error occurred'),
      ),
    };
  }

  protected getHttpStatusForDomainException(error: DomainException): number {
    switch (error.code) {
      case 'ENTITY_NOT_FOUND':
        return 404;
      case 'VALIDATION_ERROR':
        return 400;
      case 'BUSINESS_RULE_VIOLATION':
        return 422;
      default:
        return 500;
    }
  }

  protected getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers':
        'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    };
  }

  protected sanitizeEvent(event: APIGatewayProxyEvent): any {
    return {
      httpMethod: event.httpMethod,
      path: event.path,
      queryStringParameters: event.queryStringParameters,
      headers: this.sanitizeHeaders(event.headers ?? {}),
    };
  }

  private sanitizeHeaders(headers: { [key: string]: string | undefined }): any {
    const sensitiveHeaders = ['authorization', 'x-api-key'];
    const sanitized: any = {};
    Object.keys(headers ?? {}).forEach((key) => {
      if (sensitiveHeaders.includes(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = headers[key];
      }
    });
    return sanitized;
  }
}
