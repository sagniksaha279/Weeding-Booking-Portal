const Checklist = require('../models/checklist');

exports.createChecklist = async (req, res) => {
  try {
    const { booking_id, items } = req.body;
    const user_id = req.user.id;
    
    let checklist = await Checklist.findOne({ booking_id, user_id });
    if (checklist) {
      checklist.items.push(...items);
      await checklist.save();
    } else {
      checklist = await Checklist.create({ booking_id, user_id, items });
    }
    res.status(201).json({ message: 'Checklist updated', checklist });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create checklist' });
  }
};

exports.getBookingChecklist = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const checklist = await Checklist.findOne({ booking_id: bookingId });
    res.json(checklist || { items: [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch checklist' });
  }
};

exports.toggleItem = async (req, res) => {
  try {
    const { checklistId, itemId } = req.params;
    const checklist = await Checklist.findById(checklistId);
    if (!checklist) return res.status(404).json({ error: 'Checklist not found' });

    const item = checklist.items.id(itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    item.is_completed = !item.is_completed;
    item.completed_at = item.is_completed ? new Date() : null;
    await checklist.save();

    res.json({ message: 'Item toggled', checklist });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle item' });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const { checklistId, itemId } = req.params;
    const checklist = await Checklist.findById(checklistId);
    if (!checklist) return res.status(404).json({ error: 'Checklist not found' });

    checklist.items = checklist.items.filter(item => item._id.toString() !== itemId);
    await checklist.save();

    res.json({ message: 'Item deleted', checklist });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
};
