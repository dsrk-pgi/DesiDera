const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'DesiDera@2026';

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = Buffer.from(`${username}:${password}`).toString('base64');
    return res.json({ success: true, token });
  }
  
  return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

router.get('/orders', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [username, password] = decoded.split(':');

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const orders = await Order.find({ 
      status: { $in: ['pending', 'served'] } 
    }).sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [username, password] = decoded.split(':');

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeTables = await Order.distinct('tableNumber', {
      status: { $in: ['pending', 'served'] }
    });

    const todayOrders = await Order.find({
      createdAt: { $gte: today }
    });

    const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.grandTotal || 0), 0);

    res.json({
      activeTables: activeTables.length,
      todayRevenue: todayRevenue.toFixed(2)
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/orders/:orderId/status', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [username, password] = decoded.split(':');

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { orderId } = req.params;
    const { status } = req.body;

    if (!['pending', 'served', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
