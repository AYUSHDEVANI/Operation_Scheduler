const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true, // e.g., 'CREATE_SURGERY', 'DELETE_DOCTOR'
  },
  actor: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    role: String
  },
  target: {
    collectionName: String, // e.g., 'doctors', 'surgeries'
    id: String,
    name: String // Readable name of the target entity
  },
  details: {
    type: mongoose.Schema.Types.Mixed // Flexible object for diffs or extra info
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
