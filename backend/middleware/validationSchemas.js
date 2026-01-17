const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('ADMIN', 'DOCTOR', 'USER').optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const doctorSchema = Joi.object({
    name: Joi.string().required(),
    specialization: Joi.string().required(),
    department: Joi.string().required(),
    contactNumber: Joi.string().required(), // Simple string check, can add regex if needed
    email: Joi.string().email().required(),
    availability: Joi.boolean(),
    workingHours: Joi.object({
        start: Joi.string(),
        end: Joi.string()
    })
});

const patientSchema = Joi.object({
    name: Joi.string().required(),
    age: Joi.number().required().min(0),
    gender: Joi.string().valid('Male', 'Female', 'Other').required(),
    contactNumber: Joi.string().required(),
    email: Joi.string().email().allow('', null), // Optional based on model
    assignedDoctor: Joi.string().hex().length(24).allow(null, ''), // ObjectId check
    medicalHistory: Joi.array().items(Joi.object({
        condition: Joi.string(),
        diagnosedDate: Joi.date(),
        details: Joi.string()
    })),
    pastSurgeries: Joi.array().items(Joi.object({
        surgeryType: Joi.string(),
        date: Joi.date(),
        notes: Joi.string()
    }))
});

const surgerySchema = Joi.object({
    patient: Joi.string().hex().length(24).required(),
    doctor: Joi.string().hex().length(24).required(),
    operationTheatre: Joi.string().hex().length(24).required(),
    date: Joi.date().iso().required(),
    startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), // HH:MM
    endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),   // HH:MM
    // startDateTime/endDateTime are usually derived on backend, but if sent:
    // startDateTime: Joi.date(),
    // endDateTime: Joi.date(),
    anesthesiaType: Joi.string().valid('General', 'Local', 'Regional', 'Sedation', 'None'),
    anesthesiologist: Joi.string().allow('', null),
    nurses: Joi.array().items(Joi.string()),
    status: Joi.string().valid('Scheduled', 'Completed', 'Cancelled', 'Rescheduled', 'Emergency'),
    priority: Joi.string().valid('Normal', 'Emergency'),
    notes: Joi.string().allow('', null)
});

const otSchema = Joi.object({
    otNumber: Joi.string().required(),
    name: Joi.string().required(),
    capacity: Joi.number().min(1),
    status: Joi.string().valid('Available', 'In Use', 'Maintenance'),
    instruments: Joi.array().items(Joi.object({
        name: Joi.string(),
        count: Joi.number(),
        status: Joi.string().valid('Available', 'In Use', 'Maintenance')
    })),
    resources: Joi.object().pattern(Joi.string(), Joi.number())
});

const resourceSchema = Joi.object({
    name: Joi.string().required(),
    type: Joi.string().valid('Drug', 'Instrument', 'Equipment', 'Consumable').required(),
    quantity: Joi.number().required().min(0),
    unit: Joi.string().required(),
    lowStockThreshold: Joi.number().min(0)
});

module.exports = {
  registerSchema,
  loginSchema,
  doctorSchema,
  patientSchema,
  surgerySchema,
  otSchema,
  resourceSchema
};
