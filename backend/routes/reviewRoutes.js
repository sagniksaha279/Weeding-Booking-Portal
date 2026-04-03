const express = require('express');
const router = express.Router();
const { createReview, getVendorReviews, getAllReviews, replyToReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createReview);
router.get('/vendor/:vendorId', getVendorReviews);
router.get('/admin/all', getAllReviews);
router.put('/reply/:id', replyToReview);

module.exports = router;
