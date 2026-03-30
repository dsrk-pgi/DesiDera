const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { connectDb } = require('./services/db');
const menuRoutes = require('./routes/menu');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const feedbackRoutes = require('./routes/feedback');

const app = express();

app.use(cors({
  origin: [
    "https://desi-dera-git-main-dsrk-pgis-projects.vercel.app",
    "http://localhost:3000"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/menu', menuRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/feedback', feedbackRoutes);

app.use('/api/bills', express.static(path.join(__dirname, '..', 'bills')));

const PORT = process.env.PORT || 8080;

connectDb()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      // no console comments
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
