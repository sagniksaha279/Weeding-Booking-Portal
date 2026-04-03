const express = require('express');
const router = express.Router();
const { createMenu, getAllMenus, getMenuById, updateMenu, deleteMenu } = require('../controllers/menuController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', createMenu);
router.get('/', getAllMenus);
router.get('/:id', getMenuById);
router.put('/:id', updateMenu);
router.delete('/:id', deleteMenu);

module.exports = router;
