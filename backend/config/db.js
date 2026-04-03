const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try{
        if(mongoose.connection.readyState >= 1) {
          console.log("Already connected");
          return;
        }
        await mongoose.connect(process.env.MONGO_URI,{tls: true});
        console.log('✅ Connected to MongoDB Atlas');
    }catch (err) {
      console.error('MongoDB connection error:', err.message);
      process.exit(1);
    }
};

module.exports = connectDB;