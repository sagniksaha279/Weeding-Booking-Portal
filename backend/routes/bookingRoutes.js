const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');

const {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
  getUserBookings,
  getVenueBookings,
  updateBookingDate,
  cancelBooking,
  getVenues
} = require('../controllers/bookingController');

const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/admin/all', getAllBookings);
router.put('/:id', updateBookingStatus);

router.post("/cancel/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    booking.status = "cancelled";
    await booking.save();
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 7);
    res.json({
      message: "Cancelled",
      nextAvailableDate: nextDate.toISOString().split("T")[0],
    });
  } catch (err) {
    res.status(500).json({ error: "Cancel failed" });
  }
});

router.post("/rebook/:id", protect, async (req, res) => {
  try {
    const { suggestedDate } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    booking.status = "pending_rebook";
    booking.requested_date = suggestedDate;
    await booking.save();
    res.json({ message: "Rebook request sent" });
  } catch (err) {
    res.status(500).json({ error: "Rebook failed" });
  }
});

router.post('/user/approve-rebook/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // Ensure the user owns this booking
    if (booking.user_id.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (booking.status !== 'pending_rebook') {
      return res.status(400).json({ error: "No pending rebook request" });
    }

    const conflict = await Booking.findOne({
      _id: { $ne: booking._id },
      event_date: booking.requested_date,
      event_location: booking.event_location,
      status: "confirmed"
    });
    if (conflict) {
      return res.status(400).json({ error: "Selected date is already booked" });
    }

    booking.previous_dates.push({ date: booking.event_date });
    booking.event_date = booking.requested_date;
    booking.status = "confirmed";
    booking.requested_date = null;
    await booking.save();

    res.json({ message: "Reschedule approved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Approval failed" });
  }
});

router.post('/user/reject-rebook/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (booking.user_id.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (booking.status !== 'pending_rebook') {
      return res.status(400).json({ error: "No pending rebook request" });
    }

    booking.status = "confirmed";
    booking.requested_date = null;
    await booking.save();

    res.json({ message: "Reschedule rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Rejection failed" });
  }
});

router.get('/booked-dates', async (req, res) => {
  try {
    const bookings = await Booking.find({ status: "confirmed" }).select('event_date');
    const dates = bookings.map(b => b.event_date.toISOString().split('T')[0]);
    res.json(dates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/user/:userId', protect, getUserBookings);
router.get('/venue/:venue', protect, getVenueBookings);
router.put('/update-date/:id', protect, updateBookingDate);
router.delete('/:id', protect, cancelBooking);
router.get('/venues', protect, getVenues);

module.exports = router;