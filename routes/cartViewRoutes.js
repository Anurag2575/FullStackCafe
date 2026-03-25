const express = require('express');
const cartController = require('../controllers/cartController');
// cart view should be accessible to guests as well; order placement will still require login

const router = express.Router();

// Cart page (no login required)
router.get('/', cartController.getCart);

module.exports = router;
