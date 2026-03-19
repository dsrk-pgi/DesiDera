const express = require('express');
const { placeOrder, getOrder, listOrdersByTable } = require('../controllers/orderController');

const router = express.Router();

router.post('/', placeOrder);
router.get('/table/:tableNumber', listOrdersByTable);
router.get('/:orderId', getOrder);

module.exports = router;
