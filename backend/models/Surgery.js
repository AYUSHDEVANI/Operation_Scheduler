const mongoose = require('mongoose');

const surgerySchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  operationTheatre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OperationTheatre',
    required: true,
  },
  date: {
    type: Date,
    required: true, // Stores date part
  },
  startTime: {
    type: String, // "HH:MM" 24h format or ISO Date
    required: true,
  },
  endTime: {
    type: String, // "HH:MM"
    required: true,
  },
  // We should probably store full Start/End DateTimes for easier querying
  startDateTime: {
    type: Date,
    required: true
  },
  endDateTime: {
    type: Date,
    required: true
  },
  
  anesthesiaType: {
    type: String, // e.g., General, Local, Regional
    enum: ['General', 'Local', 'Regional', 'Sedation', 'None'],
    default: 'General'
  },
  anesthesiologist: {
    type: String, // Name for now
  },
  nurses: [String], // Array of nurse names
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled', 'Emergency'],
    default: 'Scheduled',
  },
  priority: {
    type: String,
    enum: ['Normal', 'Emergency'],
    default: 'Normal',
  },
  notes: String,
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
});

// Indexes for performance optimization on conflict checks
surgerySchema.index({ doctor: 1, startDateTime: 1, endDateTime: 1 });
surgerySchema.index({ operationTheatre: 1, startDateTime: 1, endDateTime: 1 });
surgerySchema.index({ status: 1 }); // Useful for stats

const Surgery = mongoose.model('Surgery', surgerySchema);
module.exports = Surgery;
