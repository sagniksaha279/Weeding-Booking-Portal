const connectDB = require('./config/db.js');
const Vendor = require('./models/vendorSchema.js');
const Menu = require('./models/menu.js');
const vendors = require('./data/vendor.js');

const menuItems = [
  { name: 'Royal Veg Thali', category: 'main_course', cuisine: 'indian', dietary_type: 'veg', price_per_plate: 800, description: 'Traditional Indian vegetarian thali with 12 items including paneer, dal, rice, and dessert', items: [{ name: 'Paneer Butter Masala', is_signature: true }, { name: 'Dal Makhani' }, { name: 'Jeera Rice' }, { name: 'Naan Basket' }] },
  { name: 'Grand Non-Veg Feast', category: 'main_course', cuisine: 'indian', dietary_type: 'non-veg', price_per_plate: 1200, description: 'Premium non-vegetarian spread with kebabs, biryani, and curries', items: [{ name: 'Chicken Biryani', is_signature: true }, { name: 'Mutton Rogan Josh' }, { name: 'Tandoori Platter' }] },
  { name: 'Continental Elegance', category: 'main_course', cuisine: 'continental', dietary_type: 'non-veg', price_per_plate: 1500, description: 'Fine dining continental course with soup, salad, main, and dessert', items: [{ name: 'Grilled Salmon', is_signature: true }, { name: 'Caesar Salad' }, { name: 'Mushroom Soup' }] },
  { name: 'Starter Platter', category: 'starter', cuisine: 'mixed', dietary_type: 'veg', price_per_plate: 400, description: 'Assorted vegetarian starters including spring rolls, tikki, and paneer', items: [{ name: 'Hara Bhara Kebab', is_signature: true }, { name: 'Paneer Tikka' }, { name: 'Spring Rolls' }] },
  { name: 'Dessert Paradise', category: 'dessert', cuisine: 'mixed', dietary_type: 'veg', price_per_plate: 350, description: 'Wedding dessert station with Indian and Western sweets', items: [{ name: 'Gulab Jamun', is_signature: true }, { name: 'Chocolate Fountain' }, { name: 'Ice Cream Station' }] },
  { name: 'Mocktail Bar', category: 'beverage', cuisine: 'mixed', dietary_type: 'veg', price_per_plate: 200, description: 'Premium mocktail and fresh juice bar with 15+ varieties', items: [{ name: 'Virgin Mojito', is_signature: true }, { name: 'Fresh Fruit Punch' }, { name: 'Rose Sherbet' }] },
  { name: 'Italian Romance', category: 'main_course', cuisine: 'italian', dietary_type: 'veg', price_per_plate: 1000, description: 'Authentic Italian wedding menu with pasta, risotto, and wood-fired pizza', items: [{ name: 'Truffle Risotto', is_signature: true }, { name: 'Margherita Pizza' }, { name: 'Tiramisu' }] },
  { name: 'Jain Special', category: 'main_course', cuisine: 'indian', dietary_type: 'jain', price_per_plate: 900, description: 'Pure Jain menu without onion, garlic, and root vegetables', items: [{ name: 'Jain Paneer Curry', is_signature: true }, { name: 'Saffron Rice' }, { name: 'Dry Fruit Halwa' }] },
];

const seedDB = async () => {
  try {
    await connectDB();

    console.log('Clearing old data...');
    await Vendor.deleteMany({});
    await Menu.deleteMany({});

    console.log('Inserting vendors...');
    await Vendor.insertMany(vendors);

    console.log('Inserting menu items...');
    await Menu.insertMany(menuItems);

    console.log('Database seeded successfully! 🎉');
    process.exit();
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDB();
