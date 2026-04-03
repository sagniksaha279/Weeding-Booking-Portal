const Message = require('../models/message');
const User = require('../models/user'); 

exports.sendMessage = async (req, res) => {
  try {
    const { receiver_id, message, booking_id } = req.body;
    const sender_id = req.user.id; 

    if (!receiver_id || !message) {
      return res.status(400).json({ error: "Receiver and message are required" });
    }

    const newMessage = await Message.create({
      sender_id,
      receiver_id,
      booking_id: booking_id || null,
      message
    });

    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send message" });
  }
};
exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender_id: currentUserId, receiver_id: userId },
        { sender_id: userId, receiver_id: currentUserId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};
exports.markAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    await Message.updateMany(
      { sender_id: userId, receiver_id: req.user.id, is_read: false },
      { is_read: true }
    );
    res.json({ message: "Messages marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to mark messages" });
  }
};