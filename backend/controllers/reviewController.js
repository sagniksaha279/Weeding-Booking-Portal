const Review = require('../models/review');
const Notification = require('../models/notification');

exports.createReview = async (req, res) => {
  try {
    const { vendor_id, booking_id, rating, title, comment } = req.body;
    const user_id = req.user.id;

    const existing = await Review.findOne({ user_id, booking_id });
    if (existing) return res.status(400).json({ error: 'You already reviewed this booking' });

    const review = await Review.create({
      user_id, vendor_id, booking_id, rating, title, comment
    });

    res.status(201).json({ message: 'Review submitted', review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create review' });
  }
};

exports.getVendorReviews = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const reviews = await Review.find({ vendor_id: vendorId })
      .populate('user_id', 'name profile_image')
      .sort({ createdAt: -1 });
    
    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    res.json({ reviews, avgRating, totalReviews: reviews.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user_id', 'name email profile_image')
      .populate('vendor_id', 'business_name')
      .populate('booking_id', 'package_name event_date')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all reviews' });
  }
};

exports.replyToReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_reply } = req.body;
    const review = await Review.findByIdAndUpdate(id, { admin_reply }, { new: true });
    if (!review) return res.status(404).json({ error: 'Review not found' });

    await Notification.create({
      user_id: review.user_id,
      title: 'Review Reply',
      message: 'The admin replied to your review.',
      type: 'review'
    });

    res.json({ message: 'Reply added', review });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reply' });
  }
};
