const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Drug', 'Instrument', 'Equipment', 'Consumable'],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
  },
  unit: {
    type: String, // e.g., "mg", "pcs", "ml"
  },
  lowStockThreshold: {
    type: Number,
    default: 10,
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
});

const Resource = mongoose.model('Resource', resourceSchema);
module.exports = Resource;
