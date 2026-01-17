const mongoose = require('mongoose');

const otSchema = new mongoose.Schema({
  otNumber: {
    type: String, // e.g., "OT-01"
    required: true,
    unique: true,
  },
  name: {
    type: String, // e.g., "General Surgery OT"
    required: true
  },
  capacity: {
    type: Number,
    default: 1, // Number of concurrent surgeries? Usually 1 per OT. No, pdf says "Efficiency".
  },
  instruments: [{
    name: String,
    count: Number,
    status: { type: String, enum: ['Available', 'In Use', 'Maintenance'], default: 'Available' }
  }],
  status: {
    type: String,
    enum: ['Available', 'In Use', 'Maintenance'],
    default: 'Available',
  },
  resources: {
    type: Map,
    of: Number, // Map of resource name to quantity
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
});

const OperationTheatre = mongoose.model('OperationTheatre', otSchema);
module.exports = OperationTheatre;
