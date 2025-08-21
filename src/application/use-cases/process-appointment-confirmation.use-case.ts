import { UseCase } from '../interfaces/use-case.interface';
import { AppointmentConfirmationEventDto } from '../dto/appointment.dto';
import { AppointmentStatus } from '../../domain/entities/appointment.entity';
import { DynamoDBService } from '../../infrastructure/services/dynamodb.service';
import { Logger } from '../../shared/utils/logger.util';

export class ProcessAppointmentConfirmationUseCase implements UseCase<AppointmentConfirmationEventDto, void> {
  private logger: Logger;

  constructor(private dynamoDBService: DynamoDBService) {
    this.logger = new Logger('ProcessAppointmentConfirmationUseCase');
  }

  async execute(input: AppointmentConfirmationEventDto): Promise<void> {
    try {
      this.logger.info('Processing appointment confirmation', {
        appointmentId: input.appointmentId,
        status: input.status,
        countryISO: input.countryISO,
      });

      // Map status
      const status = input.status === 'completed' 
        ? AppointmentStatus.COMPLETED 
        : AppointmentStatus.FAILED;

      // Update appointment status in DynamoDB
      await this.dynamoDBService.updateAppointmentStatus(
        input.appointmentId,
        status,
        new Date(input.processedAt),
        input.errorMessage
      );

      this.logger.info('Appointment status updated successfully', {
        appointmentId: input.appointmentId,
        status,
        countryISO: input.countryISO,
      });
    } catch (error) {
      this.logger.error('Error processing appointment confirmation', {
        error: error.message,
        appointmentId: input.appointmentId,
        status: input.status,
        countryISO: input.countryISO,
      });
      throw error;
    }
  }
}
