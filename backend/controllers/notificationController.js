const Notification = require('../models/notification');

exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user_id: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({ user_id: req.user.id, is_read: false });
    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { is_read: true });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user_id: req.user.id, is_read: false }, { is_read: true });
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark all' });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete' });
  }
};

exports.createNotification = async (userId, title, message, type = 'system', link = '') => {
  try {
    await Notification.create({ user_id: userId, title, message, type, link });
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
};
