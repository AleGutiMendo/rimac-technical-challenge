import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { Appointment, AppointmentStatus } from '../../domain/entities/appointment.entity';
import { Logger } from '../../shared/utils/logger.util';

export class DynamoDBService {
  private client: DynamoDBDocumentClient;
  private tableName: string;
  private logger: Logger;

  constructor() {
    const dynamoClient = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
    this.client = DynamoDBDocumentClient.from(dynamoClient);
    this.tableName = process.env.APPOINTMENTS_TABLE || 'appointments';
    this.logger = new Logger('DynamoDBService');
  }

  async putAppointment(appointment: Appointment): Promise<void> {
    const item = {
      id: appointment.id,
      insuredId: appointment.insuredId,
      scheduleId: appointment.scheduleId,
      countryISO: appointment.countryISO,
      status: appointment.status,
      processedAt: appointment.processedAt?.toISOString(),
      errorMessage: appointment.errorMessage,
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString(),
    };

    const command = new PutCommand({
      TableName: this.tableName,
      Item: item,
    });

    try {
      await this.client.send(command);
      this.logger.info('Appointment saved to DynamoDB', { appointmentId: appointment.id });
    } catch (error) {
      this.logger.error('Error saving appointment to DynamoDB', { 
        error: error.message, 
        appointmentId: appointment.id 
      });
      throw error;
    }
  }

  async getAppointment(appointmentId: string): Promise<Appointment | null> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { id: appointmentId },
    });

    try {
      const result = await this.client.send(command);
      if (!result.Item) {
        return null;
      }

      return this.mapItemToAppointment(result.Item);
    } catch (error) {
      this.logger.error('Error getting appointment from DynamoDB', { 
        error: error.message, 
        appointmentId 
      });
      throw error;
    }
  }

  async getAppointmentsByInsuredId(insuredId: string): Promise<Appointment[]> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'insuredId-index',
      KeyConditionExpression: 'insuredId = :insuredId',
      ExpressionAttributeValues: {
        ':insuredId': insuredId,
      },
    });

    try {
      const result = await this.client.send(command);
      if (!result.Items) {
        return [];
      }

      return result.Items.map(item => this.mapItemToAppointment(item));
    } catch (error) {
      this.logger.error('Error getting appointments by insuredId from DynamoDB', { 
        error: error.message, 
        insuredId 
      });
      throw error;
    }
  }

  async updateAppointmentStatus(
    appointmentId: string, 
    status: AppointmentStatus, 
    processedAt?: Date, 
    errorMessage?: string
  ): Promise<void> {
    const updateExpression = 'SET #status = :status, updatedAt = :updatedAt';
    const expressionAttributeNames: any = { '#status': 'status' };
    const expressionAttributeValues: any = {
      ':status': status,
      ':updatedAt': new Date().toISOString(),
    };

    let finalUpdateExpression = updateExpression;

    if (processedAt) {
      finalUpdateExpression += ', processedAt = :processedAt';
      expressionAttributeValues[':processedAt'] = processedAt.toISOString();
    }

    if (errorMessage) {
      finalUpdateExpression += ', errorMessage = :errorMessage';
      expressionAttributeValues[':errorMessage'] = errorMessage;
    }

    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: { id: appointmentId },
      UpdateExpression: finalUpdateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    });

    try {
      await this.client.send(command);
      this.logger.info('Appointment status updated in DynamoDB', { 
        appointmentId, 
        status 
      });
    } catch (error) {
      this.logger.error('Error updating appointment status in DynamoDB', { 
        error: error.message, 
        appointmentId 
      });
      throw error;
    }
  }

  private mapItemToAppointment(item: any): Appointment {
    return new Appointment(
      item.id,
      item.insuredId,
      item.scheduleId,
      item.countryISO,
      item.status,
      item.processedAt ? new Date(item.processedAt) : undefined,
      item.errorMessage,
      new Date(item.createdAt),
      new Date(item.updatedAt)
    );
  }
}
