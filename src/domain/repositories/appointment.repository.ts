import { BaseRepository } from './base.repository';
import { Appointment, AppointmentStatus, CountryISO } from '../entities/appointment.entity';

export interface AppointmentRepository extends BaseRepository<Appointment> {
  findByInsuredId(insuredId: string): Promise<Appointment[]>;
  findByStatus(status: AppointmentStatus): Promise<Appointment[]>;
  findByCountryISO(countryISO: CountryISO): Promise<Appointment[]>;
  updateStatus(id: string, status: AppointmentStatus, processedAt?: Date, errorMessage?: string): Promise<Appointment | null>;
}
