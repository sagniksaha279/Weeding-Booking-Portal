const Booking = require('../models/booking.js');

exports.createBooking = async (req, res) => {
  try {
    const {
      package_name,
      addons,
      total_price,
      event_date,
      event_location
    } = req.body;

    const userId = req.user.id;

    const existing = await Booking.findOne({
      event_date,
      event_location,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existing) {
      return res.status(400).json({
        error: "This date is already booked for selected venue"
      });
    }

    const newBooking = await Booking.create({
      user_id: userId,
      package_name,
      addons,
      total_price,
      event_date,
      event_location,
      status: "pending"
    });

    res.status(201).json({
      message: "Booking submitted for review",
      booking: newBooking
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create booking" });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.find({ user_id: userId }).sort({ event_date: -1 });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('user_id', 'name email').sort({ createdAt: -1 });
    const formatted = bookings.map(b => ({
      ...b._doc,
      client_name: b.user_id?.name,
      client_email: b.user_id?.email
    }));
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch all bookings" });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_note } = req.body;
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    if (status === "confirmed") {
      const clash = await Booking.findOne({
        _id: { $ne: id },
        event_date: booking.event_date,
        event_location: booking.event_location,
        status: "confirmed"
      });
      if (clash) {
        return res.status(400).json({ error: "Venue already booked on this date" });
      }
    }
    if (status === "cancelled") {
      let nextDate = new Date(booking.event_date);
      let found = false;
      while (!found) {
        nextDate.setDate(nextDate.getDate() + 1);
        const clash = await Booking.findOne({
          event_date: nextDate,
          event_location: booking.event_location,
          status: "confirmed"
        });
        if (!clash) {
          found = true;
        }
      }
      booking.suggested_date = nextDate;
    }
    booking.status = status;
    booking.admin_note = admin_note || "";
    await booking.save();
    res.json({
      message: `Booking ${status} successfully`,
      booking,
      suggested_date: booking.suggested_date
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update booking" });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized to view other user's bookings" });
    }
    const bookings = await Booking.find({ user_id: userId }).sort({ event_date: -1 });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user bookings" });
  }
};

exports.getVenueBookings = async (req, res) => {
  try {
    const { venue } = req.params;
    const bookings = await Booking.find({ event_location: venue })
      .populate('user_id', 'name email')
      .sort({ event_date: 1 });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch venue bookings" });
  }
};

exports.updateBookingDate = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_date } = req.body;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    const conflict = await Booking.findOne({
      _id: { $ne: id },
      event_location: booking.event_location,
      event_date: new_date,
      status: "confirmed"
    });
    if (conflict) {
      return res.status(400).json({ error: "Date not available for this venue" });
    }
    booking.previous_dates.push({ date: booking.event_date });
    booking.event_date = new_date;
    booking.status = "updated";
    await booking.save();
    res.json({ message: "Booking date updated successfully", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update booking date" });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    booking.status = "cancelled";
    await booking.save();
    res.json({ message: "Booking cancelled, date is now free", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to cancel booking" });
  }
};

exports.getVenues = async (req, res) => {
  try {
    const venues = await Booking.distinct('event_location');
    res.json(venues);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch venues" });
  }
};