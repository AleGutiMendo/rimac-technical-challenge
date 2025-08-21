import { DynamoDBService } from '../../infrastructure/services/dynamodb.service';
import { ValidationException } from '../../shared/exceptions/domain.exception';
import {
  AppointmentResponseDto,
  ListAppointmentsResponseDto,
} from '../dto/appointment.dto';
import { ListAppointmentsInputSchema } from '../dto/validation-schemas';
import { UseCase } from '../interfaces/use-case.interface';

export interface ListAppointmentsInputDto {
  insuredId: string;
}

export class ListAppointmentsUseCase
  implements UseCase<ListAppointmentsInputDto, ListAppointmentsResponseDto>
{
  constructor(private dynamoDBService: DynamoDBService) {}

  async execute(
    input: ListAppointmentsInputDto,
  ): Promise<ListAppointmentsResponseDto> {
    // Validate input
    this.validateInput(input);

    // Get appointments from DynamoDB
    const appointments = await this.dynamoDBService.getAppointmentsByInsuredId(
      input.insuredId,
    );

    // Map to response DTOs
    const appointmentDtos: AppointmentResponseDto[] = appointments.map(
      (appointment) => ({
        id: appointment.id,
        insuredId: appointment.insuredId,
        scheduleId: appointment.scheduleId,
        countryISO: appointment.countryISO,
        status: appointment.status,
        processedAt: appointment.processedAt?.toISOString(),
        errorMessage: appointment.errorMessage,
        createdAt: appointment.createdAt.toISOString(),
        updatedAt: appointment.updatedAt.toISOString(),
      }),
    );

    return {
      appointments: appointmentDtos,
      total: appointmentDtos.length,
    };
  }

  private validateInput(input: ListAppointmentsInputDto): void {
    const { error } = ListAppointmentsInputSchema.validate(input);
    if (error) {
      throw new ValidationException(error.details[0].message);
    }
  }
}
