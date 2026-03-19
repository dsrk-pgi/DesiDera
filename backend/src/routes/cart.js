const express = require('express');
const {
  getCart,
  addCartItem,
  updateCartItem,
  clearCart
} = require('../controllers/cartController');

const router = express.Router();

router.get('/:tableNumber', getCart);
router.post('/:tableNumber/items', addCartItem);
router.patch('/:tableNumber/items', updateCartItem);
router.delete('/:tableNumber', clearCart);

module.exports = router;
