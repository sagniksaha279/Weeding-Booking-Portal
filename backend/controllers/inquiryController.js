const Inquiry = require('../models/inquiry.js');

const createInquiry = async (req, res) => {
  try {
    const { vendor_id, event_date, message } = req.body;
    const user_id = req.user.id;
    const newInquiry = await Inquiry.create({
      user_id,
      vendor_id,
      event_date,
      message
    });

    res.status(201).json(newInquiry);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to submit inquiry' });
  }
};

const getUserInquiries = async (req, res) => {
  try {
    const user_id = req.user.id;

    const inquiries = await Inquiry.find({ user_id })
      .populate('vendor_id', 'business_name category') 
      .sort({ createdAt: -1 });
      
    const formatted = inquiries.map(i => ({
      id: i._id,
      event_date: i.event_date,
      message: i.message,
      status: i.status,
      created_at: i.createdAt,
      business_name: i.vendor_id?.business_name,
      category: i.vendor_id?.category
    }));

    res.json(formatted);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
};

module.exports = { createInquiry, getUserInquiries };