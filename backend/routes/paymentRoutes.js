const express = require('express');
const router = express.Router();
const { createPayment, getBookingPayments, getUserPayments, getAllPayments, getRevenueStats } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createPayment);
router.get('/my-payments', protect, getUserPayments);
router.get('/booking/:bookingId', protect, getBookingPayments);
router.get('/admin/all', getAllPayments);
router.get('/admin/revenue', getRevenueStats);

module.exports = router;
