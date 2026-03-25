const User = require('../models/User');
const Order = require('../models/Order');

// POST: Add Item to Cart
exports.addToCart = (req, res) => {
    const { itemId, name, price } = req.body;
    if (!req.session.cart) req.session.cart = [];
    
    const existingItem = req.session.cart.find(item => item.itemId === itemId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        req.session.cart.push({ itemId, name, price, quantity: 1 });
    }
    res.redirect(req.get('referer') || '/');
};

// GET: View Cart (with optional orders tab)
exports.getCart = async (req, res) => {
    const cart = req.session.cart || [];
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // if the user is logged in, also fetch their orders to show in a tab
    let activeOrders = [];
    let pastOrders = [];
    if (req.session && req.session.userId) {
        const userId = req.session.userId;
        const allOrders = await Order.find({ userId }).sort({ createdAt: -1 });
        activeOrders = allOrders.filter(o => o.status === 'Pending' || o.status === 'Preparing');
        pastOrders = allOrders.filter(o => o.status === 'Completed' || o.status === 'Delivered');
    }
    
    res.render('cart', { cart, total, error: null, activeOrders, pastOrders });
};

// POST: Increase Item Quantity
exports.increaseQuantity = (req, res) => {
    const { itemId } = req.params;
    if (!req.session.cart) req.session.cart = [];
    
    const cartItem = req.session.cart.find(item => item.itemId === itemId);
    if (cartItem) {
        cartItem.quantity += 1;
    }
    
    res.redirect(req.get('referer') || '/');
};

// POST: Decrease Item Quantity
exports.decreaseQuantity = (req, res) => {
    const { itemId } = req.params;
    if (!req.session.cart) req.session.cart = [];
    
    const cartItem = req.session.cart.find(item => item.itemId === itemId);
    if (cartItem) {
        if (cartItem.quantity > 1) {
            cartItem.quantity -= 1;
        }
    }
    
    res.redirect(req.get('referer') || '/');
};

// POST: Remove Item from Cart
exports.removeFromCart = (req, res) => {
    const { itemId } = req.params;
    if (req.session.cart) {
        req.session.cart = req.session.cart.filter(item => item.itemId !== itemId);
    }
    res.redirect(req.get('referer') || '/');
};
