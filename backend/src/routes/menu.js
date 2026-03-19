const express = require('express');
const { listMenu } = require('../controllers/menuController');

const router = express.Router();

router.get('/', listMenu);

module.exports = router;
