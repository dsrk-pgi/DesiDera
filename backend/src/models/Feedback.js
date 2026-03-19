const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comments: { type: String, default: '', trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
