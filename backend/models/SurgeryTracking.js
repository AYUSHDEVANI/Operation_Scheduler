const mongoose = require('mongoose');

const surgeryTrackingSchema = new mongoose.Schema({
  surgery: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Surgery',
    required: true,
    unique: true
  },
  preOpChecklist: {
    patientConsent: { type: Boolean, default: false },
    anesthesiaCheck: { type: Boolean, default: false },
    fastingComplete: { type: Boolean, default: false },
    siteMarking: { type: Boolean, default: false },
    notes: String
  },
  postOpNotes: {
    type: String,
  },
  complications: {
    type: String,
    default: 'None'
  },
  recoveryStatus: {
    type: String,
    enum: ['Stable', 'Critical', 'Recovering', 'Discharged'],
    default: 'Stable'
  },
  nurseInCharge: String,
  attachments: [{
    fileName: String,
    filePath: String,
    fileType: String,
    uploadDate: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

const SurgeryTracking = mongoose.model('SurgeryTracking', surgeryTrackingSchema);
module.exports = SurgeryTracking;
