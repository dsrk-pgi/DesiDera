require('dotenv').config();
const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

async function migrateMenuAvailability() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const result = await MenuItem.updateMany(
      { isAvailable: { $exists: false } },
      { $set: { isAvailable: true } }
    );

    console.log(`Updated ${result.modifiedCount} menu items to be available by default`);

    const allItems = await MenuItem.find();
    console.log(`Total menu items: ${allItems.length}`);
    console.log('Available items:', allItems.filter(i => i.isAvailable !== false).length);

    await mongoose.connection.close();
    console.log('Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateMenuAvailability();
