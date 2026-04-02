const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true, trim: true },
    priceHalf: { type: Number, required: true, min: 0 },
    priceFull: { type: Number, required: true, min: 0 },
    category: { type: String, default: '', trim: true },
    isAvailable: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('MenuItem', menuItemSchema);
