const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },
  booking_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: String,
  comment: {
    type: String,
    required: true
  },
  images: [String],
  helpful_count: {
    type: Number,
    default: 0
  },
  admin_reply: String,
  is_verified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
