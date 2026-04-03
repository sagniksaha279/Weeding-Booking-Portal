const Payment = require('../models/payment');
const Booking = require('../models/booking');
const Notification = require('../models/notification');

exports.createPayment = async (req, res) => {
  try {
    const { booking_id, amount, payment_method, payment_type, transaction_id, notes } = req.body;
    const user_id = req.user.id;

    const booking = await Booking.findById(booking_id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const payment = await Payment.create({
      booking_id, user_id, amount, payment_method, payment_type,
      transaction_id: transaction_id || '', notes: notes || '',
      status: 'completed'
    });

    // Update booking payment status
    const allPayments = await Payment.find({ booking_id, status: 'completed' });
    const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);
    
    if (totalPaid >= booking.total_price) {
      booking.payment_status = 'paid';
    } else if (totalPaid > 0) {
      booking.payment_status = 'partial';
    }
    await booking.save();

    // Create notification
    await Notification.create({
      user_id,
      title: 'Payment Recorded',
      message: `Payment of ₹${amount} for ${booking.package_name} has been recorded.`,
      type: 'payment',
      link: '/dashboard/bookings'
    });

    res.status(201).json({ message: 'Payment recorded successfully', payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to record payment' });
  }
};

exports.getBookingPayments = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const payments = await Payment.find({ booking_id: bookingId })
      .populate('user_id', 'name email')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

exports.getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user_id: req.user.id })
      .populate('booking_id', 'package_name event_date event_location total_price')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('user_id', 'name email')
      .populate('booking_id', 'package_name event_date event_location total_price')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all payments' });
  }
};

exports.getRevenueStats = async (req, res) => {
  try {
    const payments = await Payment.find({ status: 'completed' });
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    
    const now = new Date();
    const thisMonth = payments.filter(p => {
      const d = new Date(p.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const monthlyRevenue = thisMonth.reduce((sum, p) => sum + p.amount, 0);

    // Monthly breakdown for chart
    const monthlyBreakdown = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthPayments = payments.filter(p => {
        const pd = new Date(p.createdAt);
        return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear();
      });
      monthlyBreakdown.push({
        month: d.toLocaleString('default', { month: 'short', year: 'numeric' }),
        revenue: monthPayments.reduce((sum, p) => sum + p.amount, 0),
        count: monthPayments.length
      });
    }

    res.json({
      totalRevenue,
      monthlyRevenue,
      totalTransactions: payments.length,
      monthlyBreakdown
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch revenue stats' });
  }
};
