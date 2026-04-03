const express = require('express');
const router = express.Router();
const { getAllVendors, getVendorById } = require('../controllers/vendorController');

router.get('/', getAllVendors);
router.get('/:id', getVendorById);

module.exports = router;