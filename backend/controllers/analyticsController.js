const Booking = require('../models/booking');
const Payment = require('../models/payment');
const User = require('../models/user');
const Guest = require('../models/guest');
const Review = require('../models/review');

exports.getAnalytics = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const totalUsers = await User.countDocuments({ role: 'client' });
    const totalGuests = await Guest.countDocuments();
    const totalReviews = await Review.countDocuments();

    // Revenue
    const payments = await Payment.find({ status: 'completed' });
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    // Bookings by month (last 6 months)
    const now = new Date();
    const bookingsByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const count = await Booking.countDocuments({
        createdAt: { $gte: start, $lte: end }
      });
      bookingsByMonth.push({
        month: start.toLocaleString('default', { month: 'short' }),
        count
      });
    }

    // Popular packages
    const packageStats = await Booking.aggregate([
      { $group: { _id: '$package_name', count: { $sum: 1 }, revenue: { $sum: '$total_price' } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Popular venues
    const venueStats = await Booking.aggregate([
      { $group: { _id: '$event_location', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Status breakdown
    const statusBreakdown = [
      { status: 'pending', count: pendingBookings, color: '#f59e0b' },
      { status: 'confirmed', count: confirmedBookings, color: '#10b981' },
      { status: 'cancelled', count: cancelledBookings, color: '#ef4444' },
      { status: 'completed', count: completedBookings, color: '#6366f1' }
    ];

    // Average rating
    const reviews = await Review.find();
    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    res.json({
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      completedBookings,
      totalUsers,
      totalGuests,
      totalReviews,
      totalRevenue,
      avgRating,
      bookingsByMonth,
      packageStats,
      venueStats,
      statusBreakdown
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};
