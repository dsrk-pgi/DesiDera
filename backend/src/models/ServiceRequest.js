const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: true
  },
  requestType: {
    type: String,
    enum: ['call_waiter', 'request_water', 'request_cleaning'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'acknowledged', 'completed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  acknowledgedAt: Date,
  completedAt: Date
});

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
