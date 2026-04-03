const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['booking', 'payment', 'reminder', 'system', 'promotion', 'review'],
    default: 'system'
  },
  is_read: {
    type: Boolean,
    default: false
  },
  link: String,
  icon: String
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
