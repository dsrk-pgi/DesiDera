const mongoose = require('mongoose');
require('dotenv').config();

const { connectDb } = require('../services/db');
const MenuItem = require('../models/MenuItem');

async function seed() {
  await connectDb();

  const items = [
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

  await MenuItem.deleteMany({});
  await MenuItem.insertMany(items);

  console.log(`Seeded ${items.length} menu items`);
  await mongoose.connection.close();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
