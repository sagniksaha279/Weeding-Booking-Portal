const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {registerUser,loginUser,logoutUser,updateProfile,changePassword} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, "user-" + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});


router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.put('/update-profile', protect, upload.single('profile_image'), updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/me', protect, async (req, res) => {
  try {
    const User = require('../models/user');
    const user = await User.findById(req.user.id).select('-password');
    if(!user)
      return res.status(404).json({ error: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
module.exports = router;