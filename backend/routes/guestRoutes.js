const express = require('express');
const router = express.Router();
const { addGuest, getBookingGuests, updateGuest, deleteGuest, updateRSVP, getGuestStats } = require('../controllers/guestController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addGuest);
router.get('/booking/:bookingId', protect, getBookingGuests);
router.get('/stats/:bookingId', protect, getGuestStats);
router.put('/:id', protect, updateGuest);
router.put('/rsvp/:id', protect, updateRSVP);
router.delete('/:id', protect, deleteGuest);

module.exports = router;
