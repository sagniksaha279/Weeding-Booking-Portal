const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, markAsRead } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/send', protect, sendMessage);
router.get('/:userId', protect, getMessages);
router.put('/read/:userId', protect, markAsRead);

module.exports = router;