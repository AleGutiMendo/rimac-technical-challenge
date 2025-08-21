import { randomUUID } from 'crypto';
import {
  Appointment,
  AppointmentStatus,
} from '../../domain/entities/appointment.entity';
import { DynamoDBService } from '../../infrastructure/services/dynamodb.service';
import { SNSService } from '../../infrastructure/services/sns.service';
import { ValidationException } from '../../shared/exceptions/domain.exception';
import {
  AppointmentSNSEventDto,
  CreateAppointmentRequestDto,
  CreateAppointmentResponseDto,
} from '../dto/appointment.dto';
import { CreateAppointmentRequestSchema } from '../dto/validation-schemas';
import { UseCase } from '../interfaces/use-case.interface';

export class CreateAppointmentUseCase
  implements UseCase<CreateAppointmentRequestDto, CreateAppointmentResponseDto>
{
  constructor(
    private dynamoDBService: DynamoDBService,
    private snsService: SNSService,
  ) {}

  async execute(
    input: CreateAppointmentRequestDto,
  ): Promise<CreateAppointmentResponseDto> {
    // Validate input
    this.validateInput(input);

    // Create appointment entity
    const appointmentId = randomUUID();
    const appointment = new Appointment(
      appointmentId,
      input.insuredId,
      input.scheduleId,
      input.countryISO,
      AppointmentStatus.PENDING,
    );

    // Save to DynamoDB
    await this.dynamoDBService.putAppointment(appointment);

    // Publish to SNS for country processing
    const snsEvent: AppointmentSNSEventDto = {
      appointmentId: appointment.id,
      insuredId: appointment.insuredId,
      scheduleId: appointment.scheduleId,
      countryISO: appointment.countryISO,
      createdAt: appointment.createdAt.toISOString(),
    };

    await this.snsService.publishAppointmentEvent(snsEvent);

    // Return response
    return {
      message: 'El agendamiento está en proceso',
      appointmentId: appointment.id,
      status: appointment.status,
    };
  }

  private validateInput(input: CreateAppointmentRequestDto): void {
    const { error } = CreateAppointmentRequestSchema.validate(input);
    if (error) {
      throw new ValidationException(error.details[0].message);
    }
  }
}
