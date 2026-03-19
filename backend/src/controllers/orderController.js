const Cart = require('../models/Cart');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { buildWhatsAppLink } = require('../services/whatsapp');
const { generateBillPdf } = require('../services/billing');

function computeUnitPrice(menuItem, variant) {
  return variant === 'half' ? menuItem.priceHalf : menuItem.priceFull;
}

async function placeOrder(req, res) {
  const { tableNumber, items } = req.body;
  const table = Number(tableNumber);

  if (!Number.isFinite(table)) {
    return res.status(400).json({ error: 'Invalid tableNumber' });
  }

  try {
    let orderItems = [];

    if (Array.isArray(items) && items.length > 0) {
      const normalized = items
        .map((i) => ({
          menuItemId: i.menuItemId,
          variant: i.variant,
          quantity: i.quantity
        }))
        .filter((i) => i.menuItemId && ['half', 'full'].includes(i.variant) && Number.isInteger(i.quantity) && i.quantity > 0);

      if (normalized.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
      }

      const ids = [...new Set(normalized.map((i) => String(i.menuItemId)))];
      const menuItems = await MenuItem.find({ _id: { $in: ids } });
      const byId = new Map(menuItems.map((m) => [String(m._id), m]));

      orderItems = normalized.map((it) => {
        const menuItem = byId.get(String(it.menuItemId));
        if (!menuItem) {
          throw new Error('Menu item not found');
        }
        const unitPrice = computeUnitPrice(menuItem, it.variant);
        const lineTotal = unitPrice * it.quantity;

        return {
          name: menuItem.name,
          variant: it.variant,
          unitPrice,
          quantity: it.quantity,
          lineTotal
        };
      });
    } else {
      const cart = await Cart.findOne({ tableNumber: table }).populate('items.menuItemId');
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
      }

      orderItems = cart.items.map((it) => {
        const menuItem = it.menuItemId;
        const unitPrice = computeUnitPrice(menuItem, it.variant);
        const lineTotal = unitPrice * it.quantity;

        return {
          name: menuItem.name,
          variant: it.variant,
          unitPrice,
          quantity: it.quantity,
          lineTotal
        };
      });

      cart.items = [];
      await cart.save();
    }

    const subTotal = orderItems.reduce((sum, it) => sum + it.lineTotal, 0);
    const gstRate = 0.18;
    const gstAmount = Number((subTotal * gstRate).toFixed(2));
    const grandTotal = Number((subTotal + gstAmount).toFixed(2));

    const timestamp = new Date().toLocaleString();
    const lines = [
      `DesiDera Order`,
      `Table: ${table}`,
      `Time: ${timestamp}`,
      '',
      ...orderItems.map((it) => `- ${it.name} (${it.variant}) x${it.quantity}`),
      '',
      `Subtotal: ₹${subTotal.toFixed(2)}`,
      `GST (18%): ₹${gstAmount.toFixed(2)}`,
      `Total: ₹${grandTotal.toFixed(2)}`
    ];

    const whatsappMessage = lines.join('\n');
    const whatsappPhone = process.env.WHATSAPP_PHONE || '7318582007';
    const whatsappLink = buildWhatsAppLink(whatsappPhone, whatsappMessage);

    const order = await Order.create({
      tableNumber: table,
      items: orderItems,
      subTotal,
      gstRate,
      gstAmount,
      grandTotal,
      whatsappMessage,
      whatsappLink
    });

    const { fileName } = await generateBillPdf({
      orderId: order._id.toString(),
      tableNumber: table,
      createdAt: order.createdAt,
      items: orderItems,
      subTotal,
      gstRate,
      gstAmount,
      grandTotal
    });

    const publicBase = process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const billUrl = `${publicBase}/api/bills/${fileName}`;

    order.billPdfPath = fileName;
    order.billUrl = billUrl;
    await order.save();

    res.json({
      ok: true,
      orderId: order._id,
      whatsappLink,
      billUrl,
      createdAt: order.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to place order' });
  }
}

async function getOrder(req, res) {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
}

async function listOrdersByTable(req, res) {
  const tableNumber = Number(req.params.tableNumber);
  if (!Number.isFinite(tableNumber)) {
    return res.status(400).json({ error: 'Invalid tableNumber' });
  }

  try {
    const orders = await Order.find({ tableNumber }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order history' });
  }
}

module.exports = { placeOrder, getOrder, listOrdersByTable };
