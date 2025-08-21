import { createConnection, Connection } from 'mysql2/promise';
import { RDSAppointmentDto } from '../../application/dto/appointment.dto';
import { Logger } from '../../shared/utils/logger.util';

export class RDSService {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('RDSService');
  }

  private async getConnection(): Promise<Connection> {
    return createConnection({
      host: process.env.RDS_HOST || 'localhost',
      port: parseInt(process.env.RDS_PORT || '3306'),
      user: process.env.RDS_USERNAME || 'admin',
      password: process.env.RDS_PASSWORD || 'password',
      database: process.env.RDS_DATABASE || 'appointments',
    });
  }

  async saveAppointment(appointment: RDSAppointmentDto): Promise<void> {
    let connection: Connection | null = null;

    try {
      connection = await this.getConnection();
      
      const query = `
        INSERT INTO appointments 
        (appointment_id, insured_id, schedule_id, country_iso, created_at, processed_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        processed_at = VALUES(processed_at)
      `;

      const values = [
        appointment.appointment_id,
        appointment.insured_id,
        appointment.schedule_id,
        appointment.country_iso,
        appointment.created_at,
        appointment.processed_at,
      ];

      await connection.execute(query, values);
      
      this.logger.info('Appointment saved to RDS', { 
        appointmentId: appointment.appointment_id,
        countryISO: appointment.country_iso 
      });
    } catch (error) {
      this.logger.error('Error saving appointment to RDS', { 
        error: error.message,
        appointmentId: appointment.appointment_id,
        countryISO: appointment.country_iso
      });
      throw error;
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  async createTableIfNotExists(countryISO: string): Promise<void> {
    let connection: Connection | null = null;

    try {
      connection = await this.getConnection();
      
      const tableName = `appointments_${countryISO.toLowerCase()}`;
      
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS ${tableName} (
          id INT AUTO_INCREMENT PRIMARY KEY,
          appointment_id VARCHAR(36) UNIQUE NOT NULL,
          insured_id VARCHAR(5) NOT NULL,
          schedule_id INT NOT NULL,
          country_iso CHAR(2) NOT NULL,
          created_at DATETIME NOT NULL,
          processed_at DATETIME NOT NULL,
          INDEX idx_insured_id (insured_id),
          INDEX idx_schedule_id (schedule_id),
          INDEX idx_country_iso (country_iso)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `;

      await connection.execute(createTableQuery);
      
      this.logger.info(`Table ${tableName} ensured to exist`);
    } catch (error) {
      this.logger.error('Error creating table in RDS', { 
        error: error.message,
        countryISO
      });
      throw error;
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }
}
