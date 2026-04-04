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
    secure: true,
    sameSite: 'none',
    path: '/',
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
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

const updateProfile = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);
    console.log("USER:", req.user);

    if (!req.user || !req.user.id)
      return res.status(401).json({ error: "Unauthorized" });

    const { name, phone, address } = req.body;
    const userId = req.user.id;
    let profile_image = null;

    if (req.file) {
      profile_image = `/uploads/${req.file.filename}`;
    } else if (req.body.profile_image) {
      profile_image = req.body.profile_image;
    }
    const updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (profile_image) updateData.profile_image = profile_image;

    if (Object.keys(updateData).length === 0)
      return res.status(400).json({ error: "No data to update" });
    const updatedUser = await User.findByIdAndUpdate(userId,{ $set: updateData },{ new: true }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);

  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
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