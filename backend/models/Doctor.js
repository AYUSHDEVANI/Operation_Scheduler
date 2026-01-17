const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  specialization: {
    type: String,
    required: true,
  },
  availability: {
    type: Boolean,
    default: true,
  },
  department: {
    type: String, // E.g., Cardiology, Neurology
    required: true, // Changed to required based on snippet
  },
  contactNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  workingHours: { // Added workingHours field
    start: { type: String, default: '09:00' },
    end: { type: String, default: '17:00' }
  },
  // Additional fields as per PDF implicit requirements
  preferredOTs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OperationTheatre'
  }],
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
});

const Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;
