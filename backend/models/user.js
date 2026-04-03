const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: String,
  address: String,
  profile_image: String,
  role: {
    type: String,
    enum: ['client', 'admin', 'vendor'],
    default: 'client'
  },
  notifications_enabled: {
    type: Boolean,
    default: true
  },
  dark_mode: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);