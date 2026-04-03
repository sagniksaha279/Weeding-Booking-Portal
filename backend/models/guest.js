const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
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
  name: {
    type: String,
    required: true
  },
  email: String,
  phone: String,
  relation: {
    type: String,
    enum: ['family', 'friend', 'colleague', 'neighbor', 'other'],
    default: 'friend'
  },
  side: {
    type: String,
    enum: ['bride', 'groom', 'mutual'],
    default: 'mutual'
  },
  table_number: Number,
  dietary_preference: {
    type: String,
    enum: ['veg', 'non-veg', 'vegan', 'jain', 'other'],
    default: 'veg'
  },
  rsvp_status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'maybe'],
    default: 'pending'
  },
  plus_ones: {
    type: Number,
    default: 0
  },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Guest', guestSchema);
