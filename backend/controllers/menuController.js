const Menu = require('../models/menu');

exports.createMenu = async (req, res) => {
  try {
    const menu = await Menu.create(req.body);
    res.status(201).json({ message: 'Menu created', menu });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create menu' });
  }
};

exports.getAllMenus = async (req, res) => {
  try {
    const { category, cuisine, dietary_type } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (cuisine) filter.cuisine = cuisine;
    if (dietary_type) filter.dietary_type = dietary_type;
    
    const menus = await Menu.find(filter).sort({ category: 1, name: 1 });
    res.json(menus);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch menus' });
  }
};

exports.getMenuById = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) return res.status(404).json({ error: 'Menu not found' });
    res.json(menu);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
};

exports.updateMenu = async (req, res) => {
  try {
    const menu = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!menu) return res.status(404).json({ error: 'Menu not found' });
    res.json({ message: 'Menu updated', menu });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update menu' });
  }
};

exports.deleteMenu = async (req, res) => {
  try {
    await Menu.findByIdAndDelete(req.params.id);
    res.json({ message: 'Menu deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete menu' });
  }
};
