const mongoose = require("mongoose");
const vendorSchema = new mongoose.Schema({
  business_name: String,
  category: String,
  description: String,
  price_range: String,
  location: String,
  cover_image_url: String
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);