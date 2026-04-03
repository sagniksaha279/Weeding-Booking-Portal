const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  package_name: {
    type: String,
    required: true
  },
  addons: {
    type: [String],
    default: []
  },
  total_price: {
    type: Number,
    required: true
  },
  event_date: {
    type: Date,
    required: true
  },
  event_end_date: {
    type: Date
  },
  event_location: {
    type: String,
    required: true
  },
  event_type: {
    type: String,
    enum: ['wedding', 'reception', 'engagement', 'mehendi', 'sangeet', 'cocktail', 'other'],
    default: 'wedding'
  },
  guest_count: {
    type: Number,
    default: 0
  },
  special_requests: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'pending_rebook', 'completed', 'in_progress'],
    default: 'pending'
  },
  payment_status: {
    type: String,
    enum: ['unpaid', 'partial', 'paid', 'refunded'],
    default: 'unpaid'
  },
  admin_note: {
    type: String,
    default: ''
  },
  requested_date: {
    type: Date
  },
  suggested_date: {
    type: Date
  },
  previous_dates: [{
    date: Date,
    updated_at: { type: Date, default: Date.now }
  }],
  menu_selection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu'
  },
  assigned_staff: [{
    name: String,
    role: String,
    phone: String
  }],
  timeline: [{
    time: String,
    activity: String,
    completed: { type: Boolean, default: false }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
