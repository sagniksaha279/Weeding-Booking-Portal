const connectDB = require('./config/db.js');
const Vendor = require('./models/vendorSchema.js');
const Menu = require('./models/menu.js');
const vendors = require('./data/vendor.js');

const menuItems = [
  { name: 'Royal Veg Thali', category: 'main_course', cuisine: 'indian', dietary_type: 'veg', price_per_plate: 800, description: 'Traditional Indian vegetarian thali', items: [{ name: 'Paneer Butter Masala', is_signature: true }] },
  { name: 'Grand Non-Veg Feast', category: 'main_course', cuisine: 'indian', dietary_type: 'non-veg', price_per_plate: 1200, description: 'Premium non-vegetarian spread', items: [{ name: 'Chicken Biryani', is_signature: true }] }
];

const seedDB = async () => {
  try {
    await connectDB();

    console.log('Checking existing data...');

    const vendorCount = await Vendor.countDocuments();
    const menuCount = await Menu.countDocuments();

    if (vendorCount === 0) {
      console.log('Inserting vendors...');
      await Vendor.insertMany(vendors);
    } else {
      console.log('Vendors already exist, skipping...');
    }

    if (menuCount === 0) {
      console.log('Inserting menu items...');
      await Menu.insertMany(menuItems);
    } else {
      console.log('Menu already exists, skipping...');
    }

    console.log('Seeding completed ✅');
    process.exit();
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDB();