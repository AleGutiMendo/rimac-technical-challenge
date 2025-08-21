const Joi = require('joi');
import { CountryISO } from '../../domain/entities/appointment.entity';

export const CreateAppointmentRequestSchema = Joi.object({
  insuredId: Joi.string()
    .pattern(/^\d{5}$/)
    .required(),
  scheduleId: Joi.number().required(),
  countryISO: Joi.string()
    .valid(...Object.values(CountryISO))
    .required(),
});

export const ListAppointmentsInputSchema = Joi.object({
  insuredId: Joi.string()
    .pattern(/^\d{5}$/)
    .required(),
});
