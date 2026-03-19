const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem');

async function getOrCreateCart(tableNumber) {
  let cart = await Cart.findOne({ tableNumber });
  if (!cart) {
    cart = await Cart.create({ tableNumber, items: [] });
  }
  return cart;
}

async function getCart(req, res) {
  const tableNumber = Number(req.params.tableNumber);
  if (!Number.isFinite(tableNumber)) {
    return res.status(400).json({ error: 'Invalid tableNumber' });
  }

  try {
    const cart = await getOrCreateCart(tableNumber);
    const populated = await cart.populate('items.menuItemId');

    res.json({
      tableNumber: populated.tableNumber,
      items: populated.items.map((it) => ({
        menuItemId: it.menuItemId._id,
        name: it.menuItemId.name,
        imageUrl: it.menuItemId.imageUrl,
        variant: it.variant,
        quantity: it.quantity,
        priceHalf: it.menuItemId.priceHalf,
        priceFull: it.menuItemId.priceFull,
        halfPrice: it.menuItemId.priceHalf,
        fullPrice: it.menuItemId.priceFull,
        category: it.menuItemId.category || ''
      }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
}

async function addCartItem(req, res) {
  const tableNumber = Number(req.params.tableNumber);
  const { menuItemId, variant, quantity } = req.body;

  if (!Number.isFinite(tableNumber)) {
    return res.status(400).json({ error: 'Invalid tableNumber' });
  }

  if (!menuItemId || !['half', 'full'].includes(variant) || !Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ error: 'Invalid item payload' });
  }

  try {
    const item = await MenuItem.findById(menuItemId);
    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    const cart = await getOrCreateCart(tableNumber);
    const existing = cart.items.find((it) => String(it.menuItemId) === String(menuItemId) && it.variant === variant);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ menuItemId, variant, quantity });
    }

    await cart.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
}

async function updateCartItem(req, res) {
  const tableNumber = Number(req.params.tableNumber);
  const { menuItemId, variant, quantity } = req.body;

  if (!Number.isFinite(tableNumber)) {
    return res.status(400).json({ error: 'Invalid tableNumber' });
  }

  if (!menuItemId || !['half', 'full'].includes(variant) || !Number.isInteger(quantity) || quantity < 0) {
    return res.status(400).json({ error: 'Invalid item payload' });
  }

  try {
    const cart = await getOrCreateCart(tableNumber);
    const idx = cart.items.findIndex((it) => String(it.menuItemId) === String(menuItemId) && it.variant === variant);

    if (idx === -1) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    if (quantity === 0) {
      cart.items.splice(idx, 1);
    } else {
      cart.items[idx].quantity = quantity;
    }

    await cart.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update cart item' });
  }
}

async function clearCart(req, res) {
  const tableNumber = Number(req.params.tableNumber);
  if (!Number.isFinite(tableNumber)) {
    return res.status(400).json({ error: 'Invalid tableNumber' });
  }

  try {
    await Cart.updateOne({ tableNumber }, { $set: { items: [] } }, { upsert: true });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear cart' });
  }
}

module.exports = {
  getCart,
  addCartItem,
  updateCartItem,
  clearCart
};
