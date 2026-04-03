const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const app = express();
connectDB();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL
];

app.use(cors({
  origin: function(origin, callback){
    if (!origin || allowedOrigins.includes(origin))
      callback(null, true);
    else
      callback(new Error("CORS not allowed"));
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const vendorRoutes = require('./routes/vendorRoutes');
const authRoutes = require('./routes/authRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const chatRoutes = require('./routes/chatRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const guestRoutes = require('./routes/guestRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const menuRoutes = require('./routes/menuRoutes');
const checklistRoutes = require('./routes/checklistRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

app.use('/api/vendors', vendorRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/checklists', checklistRoutes);
app.use('/api/analytics', analyticsRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Wedding Banquet Management API is fully operational 🚀');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
