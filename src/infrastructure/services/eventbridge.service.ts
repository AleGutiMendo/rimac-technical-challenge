import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';
import { AppointmentConfirmationEventDto } from '../../application/dto/appointment.dto';
import { Logger } from '../../shared/utils/logger.util';

export class EventBridgeService {
  private client: EventBridgeClient;
  private eventBusName: string;
  private logger: Logger;

  constructor() {
    this.client = new EventBridgeClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
    this.eventBusName = process.env.APPOINTMENTS_EVENT_BUS_NAME || '';
    this.logger = new Logger('EventBridgeService');

    if (!this.eventBusName) {
      this.logger.error(
        'APPOINTMENTS_EVENT_BUS_NAME environment variable is not set',
      );
      throw new Error(
        'APPOINTMENTS_EVENT_BUS_NAME environment variable is required',
      );
    }
  }

  async publishAppointmentConfirmation(
    event: AppointmentConfirmationEventDto,
  ): Promise<void> {
    const eventDetail = JSON.stringify(event);

    const command = new PutEventsCommand({
      Entries: [
        {
          Source: 'appointments.country.processor',
          DetailType: 'Appointment Processed',
          Detail: eventDetail,
          EventBusName: this.eventBusName,
        },
      ],
    });

    try {
      const result = await this.client.send(command);
      this.logger.info('Appointment confirmation published to EventBridge', {
        appointmentId: event.appointmentId,
        status: event.status,
        countryISO: event.countryISO,
        eventId: result.Entries?.[0]?.EventId,
      });
    } catch (error) {
      this.logger.error(
        'Error publishing appointment confirmation to EventBridge',
        {
          error: error.message,
          appointmentId: event.appointmentId,
          status: event.status,
          countryISO: event.countryISO,
        },
      );
      throw error;
    }
  }
}
