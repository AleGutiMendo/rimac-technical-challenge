import {
  AppointmentStatus,
  CountryISO,
} from '../../domain/entities/appointment.entity';

export class CreateAppointmentRequestDto {
  insuredId: string;
  scheduleId: number;
  countryISO: CountryISO;
}

export class AppointmentResponseDto {
  id: string;
  insuredId: string;
  scheduleId: number;
  countryISO: CountryISO;
  status: AppointmentStatus;
  processedAt?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export class CreateAppointmentResponseDto {
  message: string;
  appointmentId: string;
  status: AppointmentStatus;
}

// Response DTO para listar appointments
export interface ListAppointmentsResponseDto {
  appointments: AppointmentResponseDto[];
  total: number;
}

// DTO para eventos SNS
export interface AppointmentSNSEventDto {
  appointmentId: string;
  insuredId: string;
  scheduleId: number;
  countryISO: CountryISO;
  createdAt: string;
}

// DTO para eventos SQS de países
export interface CountryAppointmentSQSEventDto {
  appointmentId: string;
  insuredId: string;
  scheduleId: number;
  countryISO: CountryISO;
  createdAt: string;
}

// DTO para eventos EventBridge de confirmación
export interface AppointmentConfirmationEventDto {
  appointmentId: string;
  status: 'completed' | 'failed';
  processedAt: string;
  errorMessage?: string;
  countryISO: CountryISO;
}

// DTO para RDS
export interface RDSAppointmentDto {
  appointment_id: string;
  insured_id: string;
  schedule_id: number;
  country_iso: string;
  created_at: string;
  processed_at: string;
}
