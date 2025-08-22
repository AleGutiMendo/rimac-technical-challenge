import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { AppointmentSNSEventDto } from '../../application/dto/appointment.dto';
import { Logger } from '../../shared/utils/logger.util';

export class SNSService {
  private client: SNSClient;
  private topicArn: string;
  private logger: Logger;

  constructor() {
    this.client = new SNSClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
    this.topicArn = process.env.APPOINTMENTS_TOPIC_ARN || '';
    this.logger = new Logger('SNSService');

    if (!this.topicArn) {
      this.logger.error(
        'APPOINTMENTS_TOPIC_ARN environment variable is not set',
      );
      throw new Error(
        'APPOINTMENTS_TOPIC_ARN environment variable is required',
      );
    }
  }

  async publishAppointmentEvent(event: AppointmentSNSEventDto): Promise<void> {
    const message = JSON.stringify(event);

    const command = new PublishCommand({
      TopicArn: this.topicArn,
      Message: message,
      MessageAttributes: {
        countryISO: {
          DataType: 'String',
          StringValue: event.countryISO,
        },
      },
    });

    try {
      this.logger.info('Publishing appointment event to SNS', {
        topicArn: this.topicArn,
        appointmentId: event.appointmentId,
        countryISO: event.countryISO,
      });

      const result = await this.client.send(command);
      this.logger.info('Appointment event published to SNS', {
        appointmentId: event.appointmentId,
        countryISO: event.countryISO,
        messageId: result.MessageId,
      });
    } catch (error) {
      this.logger.error('Error publishing appointment event to SNS', {
        error: error.message,
        topicArn: this.topicArn,
        appointmentId: event.appointmentId,
        countryISO: event.countryISO,
      });
      throw error;
    }
  }
}
