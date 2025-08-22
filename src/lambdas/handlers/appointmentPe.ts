import { SQSEvent, SQSRecord, Context, Handler } from 'aws-lambda';
import { ProcessAppointmentPeUseCase } from '../../application/use-cases/process-appointment-pe.use-case';
import { CountryAppointmentSQSEventDto } from '../../application/dto/appointment.dto';
import { RDSService } from '../../infrastructure/services/rds.service';
import { EventBridgeService } from '../../infrastructure/services/eventbridge.service';
import { Logger } from '../../shared/utils/logger.util';
import { ensureBootstrap } from '../shared/bootstrap';

const logger = new Logger('AppointmentPeHandler');

export const handler: Handler<SQSEvent, void> = async (
  event: SQSEvent,
  context: Context
): Promise<void> => {
  // Ensure dependencies are bootstrapped
  await ensureBootstrap();

  // Initialize services
  const rdsService = new RDSService();
  const eventBridgeService = new EventBridgeService();
  const useCase = new ProcessAppointmentPeUseCase(rdsService, eventBridgeService);

  // Process each SQS record
  for (const record of event.Records) {
    try {
      await processRecord(record, useCase);
    } catch (error) {
      logger.error('Error processing SQS record', {
        error: error.message,
        messageId: record.messageId,
      });
      // Continue processing other records
    }
  }
};

async function processRecord(
  record: SQSRecord,
  useCase: ProcessAppointmentPeUseCase
): Promise<void> {
  try {
    // Parse SNS message from SQS
    const snsMessage = JSON.parse(record.body);
    const appointmentEvent: CountryAppointmentSQSEventDto = JSON.parse(snsMessage.Message);

    logger.info('Processing Peru appointment from SQS', {
      appointmentId: appointmentEvent.appointmentId,
      messageId: record.messageId,
    });

    // Execute use case
    await useCase.execute(appointmentEvent);

    logger.info('Peru appointment processed successfully', {
      appointmentId: appointmentEvent.appointmentId,
      messageId: record.messageId,
    });
  } catch (error) {
    logger.error('Error processing Peru appointment', {
      error: error.message,
      messageId: record.messageId,
      body: record.body,
    });
    throw error;
  }
}
