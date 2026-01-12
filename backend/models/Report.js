const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  surgery: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Surgery',
    required: true,
  },
  type: {
    type: String,
    enum: ['Pre-Op', 'Post-Op', 'Lab', 'Imaging', 'Other'], 
    required: true,
  },
  title: String,
  fileUrl: {
    type: String, // URL to cloud storage or local path
    required: true,
  },
  notes: String,
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
}, {
  timestamps: true,
});

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
