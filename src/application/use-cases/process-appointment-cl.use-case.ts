import { EventBridgeService } from '../../infrastructure/services/eventbridge.service';
import { RDSService } from '../../infrastructure/services/rds.service';
import { Logger } from '../../shared/utils/logger.util';
import {
  AppointmentConfirmationEventDto,
  CountryAppointmentSQSEventDto,
  RDSAppointmentDto,
} from '../dto/appointment.dto';
import { UseCase } from '../interfaces/use-case.interface';

export class ProcessAppointmentClUseCase
  implements UseCase<CountryAppointmentSQSEventDto, void>
{
  private logger: Logger;

  constructor(
    private rdsService: RDSService,
    private eventBridgeService: EventBridgeService,
  ) {
    this.logger = new Logger('ProcessAppointmentClUseCase');
  }

  async execute(input: CountryAppointmentSQSEventDto): Promise<void> {
    try {
      this.logger.info('Processing Chile appointment', {
        appointmentId: input.appointmentId,
        insuredId: input.insuredId,
      });

      // Save appointment to RDS
      const rdsAppointment: RDSAppointmentDto = {
        appointment_id: input.appointmentId,
        insured_id: input.insuredId,
        schedule_id: input.scheduleId,
        country_iso: input.countryISO,
        created_at: input.createdAt,
        processed_at: new Date().toISOString(),
      };

      await this.rdsService.saveAppointment(rdsAppointment);

      // Chile-specific business logic can be added here
      // For now, we'll just simulate successful processing

      // Publish confirmation to EventBridge
      const confirmationEvent: AppointmentConfirmationEventDto = {
        appointmentId: input.appointmentId,
        status: 'completed',
        processedAt: new Date().toISOString(),
        countryISO: input.countryISO,
      };

      await this.eventBridgeService.publishAppointmentConfirmation(
        confirmationEvent,
      );

      this.logger.info('Chile appointment processed successfully', {
        appointmentId: input.appointmentId,
      });
    } catch (error) {
      this.logger.error('Error processing Chile appointment', {
        error: error.message,
        appointmentId: input.appointmentId,
      });

      // Publish failure event
      const failureEvent: AppointmentConfirmationEventDto = {
        appointmentId: input.appointmentId,
        status: 'failed',
        processedAt: new Date().toISOString(),
        errorMessage: error.message,
        countryISO: input.countryISO,
      };

      try {
        await this.eventBridgeService.publishAppointmentConfirmation(
          failureEvent,
        );
      } catch (eventError) {
        this.logger.error('Error publishing failure event', {
          error: eventError.message,
          appointmentId: input.appointmentId,
        });
      }

      throw error;
    }
  }
}
