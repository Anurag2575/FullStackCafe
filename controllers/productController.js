const { getAllItems } = require('../storage');

// GET: Home Page with Products
exports.getHome = async (req, res) => {
    const items = await getAllItems();
    res.render('index', { items });
};

// GET: Products Page
exports.getProducts = async (req, res) => {
    const items = await getAllItems();
    res.render('products', { items });
};
