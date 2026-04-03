const mongoose = require('mongoose');

const checklistSchema = new mongoose.Schema({
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
  items: [{
    title: { type: String, required: true },
    description: String,
    category: {
      type: String,
      enum: ['venue', 'catering', 'decor', 'photography', 'music', 'attire', 'transport', 'misc'],
      default: 'misc'
    },
    due_date: Date,
    is_completed: { type: Boolean, default: false },
    completed_at: Date,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    assigned_to: String,
    notes: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Checklist', checklistSchema);
