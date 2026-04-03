const User = require('../models/user');
const { genSalt, hash, compare } = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const setCookie = (res, token) => {
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    setCookie(res, generateToken(user._id));

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email
    });

  } catch (err) {
    res.status(500).json({ error: 'Server error during registration' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    setCookie(res, generateToken(user._id));

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      profile_image: user.profile_image
    });

  } catch (err) {
    res.status(500).json({ error: 'Server error during login' });
  }
};

const logoutUser = (req, res) => {
  res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ message: 'Logged out successfully' });
};

const updateProfile = async (req, res) => {
  const { name, phone, address } = req.body;
  const userId = req.user.id;

  const profile_image = req.file
    ? `/uploads/${req.file.filename}`
    : req.body.profile_image;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          ...(name && { name }),
          ...(phone && { phone }),
          ...(address && { address }),
          ...(profile_image && { profile_image })
        }
      },
      { new: true }
    ).select('-password');

    res.json(updatedUser);

  } catch (err) {
    res.status(500).json({ error: "Server error updating profile" });
  }
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);

    const isMatch = await compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect current password" });
    }

    const salt = await genSalt(10);
    user.password = await hash(newPassword, salt);

    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    res.status(500).json({ error: "Server error changing password" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  updateProfile,
  changePassword
};