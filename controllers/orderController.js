const User = require('../models/User');
const Order = require('../models/Order');

// POST: Place Order
exports.placeOrder = async (req, res) => {
    console.log('placeOrder called, session userId:', req.session && req.session.userId);
    const cart = req.session.cart || [];
    if (cart.length === 0) return res.redirect('/cart');

    // make sure we have a logged-in user id; if not, kick them to login
    const userId = (req.user && req.user.id) || req.session.userId;
    if (!userId) {
        console.log('placeOrder: no userId, redirecting to login');
        req.session.returnTo = '/cart';
        return res.redirect('/login');
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create order
    Order.create({
        userId: userId,
        items: cart,
        total: total,
        status: 'Pending'
    }).then(order => {
        console.log('Order created successfully:', order._id);
    }).catch(err => {
        console.error('Error creating order:', err);
        req.session.message = 'Error placing order. Please try again.';
    });

    // Clear cart, set flash message, and redirect to home/menu
    req.session.cart = [];
    req.session.message = 'Order confirmed! Thank you for your purchase.';
    console.log('placeOrder: redirecting to /');
    res.redirect('/');
};

// GET: Confirmation page after placing an order
exports.confirmationPage = (req, res) => {
    res.render('order-confirmation');
};

// GET: View Order History (Active and Past Orders)
exports.getOrders = async (req, res) => {
    const userId = req.user.id || req.session.userId;
    const user = await User.findById(userId);
    const allOrders = await Order.find({ userId: userId }).sort({ createdAt: -1 });
    
    // Separate active and past orders
    const activeOrders = allOrders.filter(o => o.status && (o.status === 'Pending' || o.status === 'Preparing'));
    const pastOrders = allOrders.filter(o => o.status && (o.status === 'Completed' || o.status === 'Delivered'));
    
    res.render('orders', { user, activeOrders, pastOrders, allOrders });
};

// POST: Wallet Top-up
exports.topupWallet = async (req, res) => {
    const { amount } = req.body;
    const user = await User.findById(req.user.id);
    user.walletBalance += parseInt(amount);
    await user.save();
    res.redirect('/dashboard');
};

