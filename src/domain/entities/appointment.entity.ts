import { BaseEntity } from './base.entity';

export enum AppointmentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum CountryISO {
  PE = 'PE',
  CL = 'CL'
}

export class Appointment extends BaseEntity {
  constructor(
    id: string,
    public readonly insuredId: string,
    public readonly scheduleId: number,
    public readonly countryISO: CountryISO,
    public readonly status: AppointmentStatus = AppointmentStatus.PENDING,
    public readonly processedAt?: Date,
    public readonly errorMessage?: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this.validateInsuredId(insuredId);
    this.validateScheduleId(scheduleId);
    this.validateCountryISO(countryISO);
  }

  private validateInsuredId(insuredId: string): void {
    // Validar que sea de 5 dígitos (puede tener ceros por delante)
    const insuredIdRegex = /^\d{5}$/;
    if (!insuredIdRegex.test(insuredId)) {
      throw new Error('InsuredId must be a 5-digit string');
    }
  }

  private validateScheduleId(scheduleId: number): void {
    if (!Number.isInteger(scheduleId) || scheduleId <= 0) {
      throw new Error('ScheduleId must be a positive integer');
    }
  }

  private validateCountryISO(countryISO: string): void {
    if (!Object.values(CountryISO).includes(countryISO as CountryISO)) {
      throw new Error('CountryISO must be either PE or CL');
    }
  }

  public markAsCompleted(): Appointment {
    return new Appointment(
      this.id,
      this.insuredId,
      this.scheduleId,
      this.countryISO,
      AppointmentStatus.COMPLETED,
      new Date(),
      this.errorMessage,
      this.createdAt,
      new Date()
    );
  }

  public markAsFailed(errorMessage: string): Appointment {
    return new Appointment(
      this.id,
      this.insuredId,
      this.scheduleId,
      this.countryISO,
      AppointmentStatus.FAILED,
      new Date(),
      errorMessage,
      this.createdAt,
      new Date()
    );
  }

  public isPending(): boolean {
    return this.status === AppointmentStatus.PENDING;
  }

  public isCompleted(): boolean {
    return this.status === AppointmentStatus.COMPLETED;
  }

  public isFailed(): boolean {
    return this.status === AppointmentStatus.FAILED;
  }
}
