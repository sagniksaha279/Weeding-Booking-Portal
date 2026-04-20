const User = require('../models/user');
const { genSalt, hash, compare } = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

/* =========================
   🔐 Helper Functions
========================= */

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Set secure cookie
const setCookie = (res, token) => {
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// ✅ Validation Functions
const isValidName = (name) => {
  return /^[A-Za-z\s]{2,50}$/.test(name.trim());
};

const isValidEmail = (email) => {
  return /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email);
};

const isValidPassword = (password) => {
  if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/.test(password)) {
    return false;
  }
  if (/^(.)\1+$/.test(password)) {
    return false; // blocks aaaaaa, 111111
  }
  return true;
};

/* =========================
   🧾 Register User
========================= */

const registerUser = async (req, res) => {
  let { name, email, password } = req.body;

  try {
    // Normalize input
    name = name?.trim();
    email = email?.toLowerCase().trim();

    // Basic check
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validation
    if (!isValidName(name)) {
      return res.status(400).json({
        error: "Name must contain only letters and spaces (2–50 chars)"
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        error: "Password must be 6+ chars, include letters & numbers, and not be repetitive"
      });
    }

    // Check existing user
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
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
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
};

/* =========================
   🔑 Login User
========================= */

const loginUser = async (req, res) => {
  let { email, password } = req.body;

  try {
    email = email?.toLowerCase().trim();

    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
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
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Server error during login" });
  }
};

/* =========================
   🚪 Logout
========================= */

const logoutUser = (req, res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
  });

  res.status(200).json({ message: "Logged out successfully" });
};

/* =========================
   👤 Update Profile
========================= */

const updateProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    let { name, phone, address } = req.body;
    const userId = req.user.id;
    let profile_image = null;

    if (name && !isValidName(name)) {
      return res.status(400).json({ error: "Invalid name" });
    }

    if (req.file) {
      profile_image = `/uploads/${req.file.filename}`;
    } else if (req.body.profile_image) {
      profile_image = req.body.profile_image;
    }

    const updateData = {};

    if (name) updateData.name = name.trim();
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (profile_image) updateData.profile_image = profile_image;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No data to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);

  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({ error: "Server error updating profile" });
  }
};

/* =========================
   🔄 Change Password
========================= */

const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({
        error: "Password must be strong (letters + numbers, no repetition)"
      });
    }

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
    console.error("CHANGE PASSWORD ERROR:", err);
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