const Vendor = require('../models/vendorSchema');
const getAllVendors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const vendors = await Vendor.find()
      .sort({ createdAt: -1 }) 
      .skip(skip)
      .limit(limit);

    const totalVendors = await Vendor.countDocuments();

    res.json({
      vendors,
      totalPages: Math.ceil(totalVendors / limit),
      currentPage: page
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while fetching vendors' });
  }
};

const getVendorById = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await Vendor.findById(id);
    if (!vendor)
      return res.status(404).json({ error: 'Vendor not found' });
    res.json(vendor);
  } catch (err) {
    console.error(err.message);
    if (err.name === 'CastError')
      return res.status(400).json({ error: 'Invalid vendor ID' });
    res.status(500).json({ error: 'Server error while fetching vendor' });
  }
};

module.exports = { getAllVendors, getVendorById };