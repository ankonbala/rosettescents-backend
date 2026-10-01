const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    gateway: { type: String, required: true, default: 'bKash' },
    paymentID: { type: String, unique: true },
    trxID: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'BDT' },
    status: { type: String, required: true, enum: ['Initiated', 'Completed', 'Failed', 'Cancelled'], default: 'Initiated' },
    gatewayResponse: { type: mongoose.Schema.Types.Mixed }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);