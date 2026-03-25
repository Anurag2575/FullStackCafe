const Item = require('../models/Item');
const User = require('../models/User');

// GET: Home Page with Products
exports.getHome = async (req, res) => {
    const items = await Item.find();
    res.render('index', { items });
};

// GET: Products Page
exports.getProducts = async (req, res) => {
    const items = await Item.find();
    res.render('products', { items });
};
