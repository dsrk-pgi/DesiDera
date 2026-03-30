const mongoose = require('mongoose');
require('dotenv').config();

const MenuItem = require('./src/models/MenuItem');
const Cart = require('./src/models/Cart');
const Order = require('./src/models/Order');
const Feedback = require('./src/models/Feedback');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Rajesh:RK516821rk@cluster0.sqevvtu.mongodb.net/DesiDeraDB?appName=Cluster0';

const menuItems = [
  {
    name: 'Paneer Masala',
    imageUrl: 'https://images.unsplash.com/photo-1604908177077-5df76e8864c8?auto=format&fit=crop&w=800&q=60',
    priceHalf: 180,
    priceFull: 320,
    category: 'Main Course'
  },
  {
    name: 'Dal Tadka',
    imageUrl: 'https://images.unsplash.com/photo-1628294896516-344c88f9b33a?auto=format&fit=crop&w=800&q=60',
    priceHalf: 140,
    priceFull: 240,
    category: 'Main Course'
  },
  {
    name: 'Butter Naan',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-c78679fcb7a1?auto=format&fit=crop&w=800&q=60',
    priceHalf: 25,
    priceFull: 45,
    category: 'Breads'
  },
  {
    name: 'Water Bottle',
    imageUrl: 'https://images.unsplash.com/photo-1526401281623-7a4b8074d7a0?auto=format&fit=crop&w=800&q=60',
    priceHalf: 10,
    priceFull: 20,
    category: 'Beverages'
  }
];

async function seed() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    console.log(`📍 URI: ${MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas successfully!\n');

    console.log('🗑️  Wiping existing collections...');
    
    const menuItemCount = await MenuItem.countDocuments();
    await MenuItem.deleteMany({});
    console.log(`   - Deleted ${menuItemCount} menu items`);

    const cartCount = await Cart.countDocuments();
    await Cart.deleteMany({});
    console.log(`   - Deleted ${cartCount} carts`);

    const orderCount = await Order.countDocuments();
    await Order.deleteMany({});
    console.log(`   - Deleted ${orderCount} orders`);

    const feedbackCount = await Feedback.countDocuments();
    await Feedback.deleteMany({});
    console.log(`   - Deleted ${feedbackCount} feedback entries\n`);

    console.log('🌱 Seeding menu items...');
    const insertedItems = await MenuItem.insertMany(menuItems);
    console.log(`✅ Successfully seeded ${insertedItems.length} menu items:`);
    insertedItems.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.name} (${item.category}) - Half: ₹${item.priceHalf}, Full: ₹${item.priceFull}`);
    });

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Menu Items: ${insertedItems.length}`);
    console.log(`   - Carts: 0 (cleared)`);
    console.log(`   - Orders: 0 (cleared)`);
    console.log(`   - Feedback: 0 (cleared)`);

    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed.');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error during seeding:');
    console.error(error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seed();
