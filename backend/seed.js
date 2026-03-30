const mongoose = require('mongoose');
require('dotenv').config();

const MenuItem = require('./src/models/MenuItem');
const Cart = require('./src/models/Cart');
const Order = require('./src/models/Order');
const Feedback = require('./src/models/Feedback');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Rajesh:RK516821rk@cluster0.sqevvtu.mongodb.net/DesiDeraDB?appName=Cluster0';

const menuItems = [
  {
    name: 'Paneer Butter Masala',
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80',
    priceHalf: 180,
    priceFull: 320,
    category: 'Main Course'
  },
  {
    name: 'Dal Tadka',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80',
    priceHalf: 140,
    priceFull: 240,
    category: 'Main Course'
  },
  {
    name: 'Chicken Biryani',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
    priceHalf: 200,
    priceFull: 350,
    category: 'Main Course'
  },
  {
    name: 'Masala Dosa',
    imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&q=80',
    priceHalf: 80,
    priceFull: 120,
    category: 'South Indian'
  },
  {
    name: 'Idli Sambar',
    imageUrl: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&q=80',
    priceHalf: 60,
    priceFull: 100,
    category: 'South Indian'
  },
  {
    name: 'Medu Vada',
    imageUrl: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&q=80',
    priceHalf: 50,
    priceFull: 90,
    category: 'South Indian'
  },
  {
    name: 'Chole Bhature',
    imageUrl: 'https://images.unsplash.com/photo-1626132647523-66f0bf380027?w=800&q=80',
    priceHalf: 120,
    priceFull: 200,
    category: 'Main Course'
  },
  {
    name: 'Tandoori Chicken',
    imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80',
    priceHalf: 220,
    priceFull: 400,
    category: 'Main Course'
  },
  {
    name: 'Samosa',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80',
    priceHalf: 30,
    priceFull: 50,
    category: 'Starters'
  },
  {
    name: 'Pav Bhaji',
    imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80',
    priceHalf: 100,
    priceFull: 160,
    category: 'Main Course'
  },
  {
    name: 'Butter Naan',
    imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80',
    priceHalf: 25,
    priceFull: 45,
    category: 'Breads'
  },
  {
    name: 'Garlic Naan',
    imageUrl: 'https://images.unsplash.com/photo-1619897044023-232e33f5a7e2?w=800&q=80',
    priceHalf: 30,
    priceFull: 50,
    category: 'Breads'
  },
  {
    name: 'Roti',
    imageUrl: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800&q=80',
    priceHalf: 15,
    priceFull: 25,
    category: 'Breads'
  },
  {
    name: 'Rava Dosa',
    imageUrl: 'https://images.unsplash.com/photo-1694159466921-c4eab2cd0b5e?w=800&q=80',
    priceHalf: 90,
    priceFull: 140,
    category: 'South Indian'
  },
  {
    name: 'Uttapam',
    imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&q=80',
    priceHalf: 85,
    priceFull: 130,
    category: 'South Indian'
  },
  {
    name: 'Gulab Jamun',
    imageUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&q=80',
    priceHalf: 40,
    priceFull: 70,
    category: 'Desserts'
  },
  {
    name: 'Rasmalai',
    imageUrl: 'https://images.unsplash.com/photo-1589119908995-c6c4c9d5c0c9?w=800&q=80',
    priceHalf: 50,
    priceFull: 90,
    category: 'Desserts'
  },
  {
    name: 'Mango Lassi',
    imageUrl: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=800&q=80',
    priceHalf: 60,
    priceFull: 100,
    category: 'Beverages'
  },
  {
    name: 'Masala Chai',
    imageUrl: 'https://images.unsplash.com/photo-1597318112874-f1a6068de621?w=800&q=80',
    priceHalf: 20,
    priceFull: 30,
    category: 'Beverages'
  },
  {
    name: 'Filter Coffee',
    imageUrl: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=800&q=80',
    priceHalf: 25,
    priceFull: 40,
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
