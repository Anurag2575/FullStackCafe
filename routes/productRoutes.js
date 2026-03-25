const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

// Product routes
router.get('/', productController.getHome);
router.get('/products', productController.getProducts);

module.exports = router;
