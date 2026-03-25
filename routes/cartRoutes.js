const express = require('express');
const cartController = require('../controllers/cartController');

const router = express.Router();

// Cart routes
router.post('/add', cartController.addToCart);
router.post('/increase/:itemId', cartController.increaseQuantity);
router.post('/decrease/:itemId', cartController.decreaseQuantity);
router.post('/remove/:itemId', cartController.removeFromCart);

module.exports = router;
