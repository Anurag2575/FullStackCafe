const express = require('express');
const orderController = require('../controllers/orderController');

const router = express.Router();

// Order routes are protected at mount time by the `protect` middleware
// (which covers both JWT and session-based auth).  This ensures any
// already-logged-in user can view or place orders without being sent
// through a separate login flow.
router.post('/place', orderController.placeOrder);
router.get('/', orderController.getOrders);
router.post('/wallet/topup', orderController.topupWallet);

module.exports = router;
