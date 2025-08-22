import { Context, Handler, SQSEvent, SQSRecord } from 'aws-lambda';
import { AppointmentConfirmationEventDto } from '../../application/dto/appointment.dto';
import { ProcessAppointmentConfirmationUseCase } from '../../application/use-cases/process-appointment-confirmation.use-case';
import { DynamoDBService } from '../../infrastructure/services/dynamodb.service';
import { Logger } from '../../shared/utils/logger.util';
import { ensureBootstrap } from '../shared/bootstrap';

const logger = new Logger('AppointmentConfirmationHandler');

export const handler: Handler<SQSEvent, void> = async (
  event: SQSEvent,
  context: Context,
): Promise<void> => {
  // Ensure dependencies are bootstrapped
  await ensureBootstrap();

  // Initialize services
  const dynamoDBService = new DynamoDBService();
  const useCase = new ProcessAppointmentConfirmationUseCase(dynamoDBService);

  // Process each SQS record
  for (const record of event.Records) {
    try {
      await processRecord(record, useCase);
    } catch (error) {
      logger.error('Error processing confirmation SQS record', {
        error: error.message,
        messageId: record.messageId,
      });
      // Continue processing other records
    }
  }
};

async function processRecord(
  record: SQSRecord,
  useCase: ProcessAppointmentConfirmationUseCase,
): Promise<void> {
  try {
    // Parse EventBridge event from SQS
    const eventBridgeEvent = JSON.parse(record.body);
    const confirmationEvent: AppointmentConfirmationEventDto =
      eventBridgeEvent.detail;

    logger.info('Processing appointment confirmation from EventBridge', {
      appointmentId: confirmationEvent.appointmentId,
      status: confirmationEvent.status,
      messageId: record.messageId,
    });

    // Execute use case
    await useCase.execute(confirmationEvent);

    logger.info('Appointment confirmation processed successfully', {
      appointmentId: confirmationEvent.appointmentId,
      status: confirmationEvent.status,
      messageId: record.messageId,
    });
  } catch (error) {
    logger.error('Error processing appointment confirmation', {
      error: error.message,
      messageId: record.messageId,
      body: record.body,
    });
    throw error;
  }
}
