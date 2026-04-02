const MenuItem = require('../models/MenuItem');

async function listMenu(req, res) {
  try {
    const docs = await MenuItem.find({ 
      $or: [
        { isAvailable: true },
        { isAvailable: { $exists: false } }
      ]
    }).sort({ createdAt: -1 });
    const items = docs.map((d) => ({
      _id: d._id,
      name: d.name,
      imageUrl: d.imageUrl,
      priceHalf: d.priceHalf,
      priceFull: d.priceFull,
      halfPrice: d.priceHalf,
      fullPrice: d.priceFull,
      category: d.category || ''
    }));

    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
}

module.exports = { listMenu };
