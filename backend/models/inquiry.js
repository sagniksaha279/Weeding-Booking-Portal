const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  event_date: Date,
  message: String,
  status: {
    type: String,
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);