const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  email: {
      type: String,
      // unique: true // Optional, depending on if we want strict uniqueness
  },
  assignedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: false
  },
  medicalHistory: [{
    condition: String,
    diagnosedDate: Date,
    details: String
  }],
  // Surgery history can be derived from SurgerySchedule module by querying, 
  // but we can store references here or just rely on surgery module.
  // PDF says "Surgery history". 
  pastSurgeries: [{
    surgeryType: String,
    date: Date,
    notes: String
  }],
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
});

const Patient = mongoose.model('Patient', patientSchema);
module.exports = Patient;
