const Guest = require('../models/guest');
const Booking = require('../models/booking');

exports.addGuest = async (req, res) => {
  try {
    const { booking_id, name, email, phone, relation, side, table_number, dietary_preference, plus_ones, notes } = req.body;
    const user_id = req.user.id;

    const booking = await Booking.findById(booking_id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const guest = await Guest.create({
      booking_id, user_id, name, email, phone, relation, side,
      table_number, dietary_preference, plus_ones: plus_ones || 0, notes
    });

    // Update guest count on booking
    const guestCount = await Guest.countDocuments({ booking_id });
    const totalGuests = await Guest.aggregate([
      { $match: { booking_id: booking._id } },
      { $group: { _id: null, total: { $sum: { $add: [1, '$plus_ones'] } } } }
    ]);
    booking.guest_count = totalGuests[0]?.total || guestCount;
    await booking.save();

    res.status(201).json({ message: 'Guest added', guest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add guest' });
  }
};

exports.getBookingGuests = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const guests = await Guest.find({ booking_id: bookingId }).sort({ createdAt: -1 });
    res.json(guests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch guests' });
  }
};

exports.updateGuest = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Guest.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Guest not found' });
    res.json({ message: 'Guest updated', guest: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update guest' });
  }
};

exports.deleteGuest = async (req, res) => {
  try {
    const { id } = req.params;
    const guest = await Guest.findByIdAndDelete(id);
    if (!guest) return res.status(404).json({ error: 'Guest not found' });

    // Recalculate guest count
    const totalGuests = await Guest.aggregate([
      { $match: { booking_id: guest.booking_id } },
      { $group: { _id: null, total: { $sum: { $add: [1, '$plus_ones'] } } } }
    ]);
    await Booking.findByIdAndUpdate(guest.booking_id, {
      guest_count: totalGuests[0]?.total || 0
    });

    res.json({ message: 'Guest removed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove guest' });
  }
};

exports.updateRSVP = async (req, res) => {
  try {
    const { id } = req.params;
    const { rsvp_status } = req.body;
    const guest = await Guest.findByIdAndUpdate(id, { rsvp_status }, { new: true });
    if (!guest) return res.status(404).json({ error: 'Guest not found' });
    res.json({ message: 'RSVP updated', guest });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update RSVP' });
  }
};

exports.getGuestStats = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const guests = await Guest.find({ booking_id: bookingId });
    
    const stats = {
      total: guests.length,
      totalWithPlusOnes: guests.reduce((sum, g) => sum + 1 + g.plus_ones, 0),
      accepted: guests.filter(g => g.rsvp_status === 'accepted').length,
      declined: guests.filter(g => g.rsvp_status === 'declined').length,
      pending: guests.filter(g => g.rsvp_status === 'pending').length,
      maybe: guests.filter(g => g.rsvp_status === 'maybe').length,
      veg: guests.filter(g => g.dietary_preference === 'veg').length,
      nonVeg: guests.filter(g => g.dietary_preference === 'non-veg').length,
      vegan: guests.filter(g => g.dietary_preference === 'vegan').length,
      brideSide: guests.filter(g => g.side === 'bride').length,
      groomSide: guests.filter(g => g.side === 'groom').length,
      mutual: guests.filter(g => g.side === 'mutual').length,
    };
    
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch guest stats' });
  }
};
