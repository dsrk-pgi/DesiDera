const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    variant: { type: String, enum: ['half', 'full'], required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    tableNumber: { type: Number, required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    subTotal: { type: Number, required: true, min: 0 },
    gstRate: { type: Number, required: true, min: 0 },
    gstAmount: { type: Number, required: true, min: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    whatsappMessage: { type: String, required: true },
    whatsappLink: { type: String, required: true },
    billPdfPath: { type: String, default: '' },
    billUrl: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'served', 'completed'], default: 'pending', index: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
