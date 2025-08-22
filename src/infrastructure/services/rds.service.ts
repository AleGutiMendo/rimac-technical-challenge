import { Connection, createConnection } from 'mysql2/promise';
import { RDSAppointmentDto } from '../../application/dto/appointment.dto';
import { Logger } from '../../shared/utils/logger.util';

export class RDSService {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('RDSService');

    // Log current RDS configuration for debugging
    this.logger.info('RDS Configuration', {
      host: process.env.RDS_HOST || 'not set',
      port: process.env.RDS_PORT || 'not set',
      database: process.env.RDS_DATABASE || 'not set',
      username: process.env.RDS_USERNAME || 'not set',
      passwordSet: !!process.env.RDS_PASSWORD,
    });

    // Validate required environment variables
    const requiredEnvVars = [
      'RDS_HOST',
      'RDS_USERNAME',
      'RDS_PASSWORD',
      'RDS_DATABASE',
    ];
    const missingVars = requiredEnvVars.filter(
      (varName) =>
        !process.env[varName] || process.env[varName] === 'localhost',
    );

    if (missingVars.length > 0) {
      this.logger.error('Missing or invalid RDS environment variables', {
        missingVars,
        note: 'RDS functions will fail until proper RDS instance is configured',
      });
      throw new Error(
        `Missing or invalid RDS environment variables: ${missingVars.join(', ')}. Please configure a real RDS instance.`,
      );
    }
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
        INSERT INTO rimac_challenge_appointments 
        (insured_id, schedule_id, country_iso, status)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        updated_at = CURRENT_TIMESTAMP
      `;

      const values = [
        appointment.insured_id,
        appointment.schedule_id,
        appointment.country_iso,
        'PROCESSED', // status field
      ];

      await connection.execute(query, values);

      this.logger.info('Appointment saved to RDS', {
        insuredId: appointment.insured_id,
        scheduleId: appointment.schedule_id,
        countryISO: appointment.country_iso,
        status: 'PROCESSED',
      });
    } catch (error) {
      this.logger.error('Error saving appointment to RDS', {
        error: error.message,
        insuredId: appointment.insured_id,
        scheduleId: appointment.schedule_id,
        countryISO: appointment.country_iso,
      });
      throw error;
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }
}
