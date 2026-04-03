const express = require('express');
const router = express.Router();
const { createChecklist, getBookingChecklist, toggleItem, deleteItem } = require('../controllers/checklistController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createChecklist);
router.get('/booking/:bookingId', protect, getBookingChecklist);
router.put('/toggle/:checklistId/:itemId', protect, toggleItem);
router.delete('/:checklistId/:itemId', protect, deleteItem);

module.exports = router;
