const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  booking_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  payment_method: {
    type: String,
    enum: ['cash', 'card', 'upi', 'bank_transfer', 'cheque'],
    default: 'cash'
  },
  transaction_id: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  payment_type: {
    type: String,
    enum: ['advance', 'partial', 'full', 'refund'],
    default: 'full'
  },
  notes: {
    type: String,
    default: ''
  },
  receipt_number: {
    type: String,
    unique: true
  }
}, { timestamps: true });

paymentSchema.pre('save', function(next) {
  if (!this.receipt_number) {
    this.receipt_number = 'RCP-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
