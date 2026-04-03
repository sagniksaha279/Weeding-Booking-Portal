const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['starter', 'main_course', 'dessert', 'beverage', 'snack', 'special'],
    required: true
  },
  cuisine: {
    type: String,
    enum: ['indian', 'chinese', 'continental', 'italian', 'mexican', 'thai', 'mixed'],
    default: 'indian'
  },
  dietary_type: {
    type: String,
    enum: ['veg', 'non-veg', 'vegan', 'jain'],
    default: 'veg'
  },
  price_per_plate: {
    type: Number,
    required: true
  },
  description: String,
  image_url: String,
  is_available: {
    type: Boolean,
    default: true
  },
  items: [{
    name: String,
    description: String,
    is_signature: { type: Boolean, default: false }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Menu', menuSchema);
