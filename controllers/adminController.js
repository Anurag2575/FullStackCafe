const Item = require('../models/Item');
const User = require('../models/User');
const Order = require('../models/Order');

// GET: Admin Panel (formerly dashboard)
exports.getAdminDashboard = async (req, res) => {
    const users = await User.find();
    const orders = await Order.find({}).populate('userId').sort({ createdAt: -1 });
    const items = await Item.find();
    const section = req.query.section || 'overview';
    res.render('admin-panel', { users, orders, items, user: req.user, section });
};

// POST: Add New Item
exports.addItem = async (req, res) => {
    const { name, price, description, isVeg } = req.body;
    await Item.create({
        name,
        price: parseFloat(price),
        description,
        isVeg: isVeg === 'on',
        image: req.body.image
    });
    res.redirect('/admin/panel?section=menu');
};

// POST: Update Item Stock Status
exports.updateItemStock = async (req, res) => {
    const { id } = req.params;
    const { inStock } = req.body; // Expects 'true' or 'false'
    
    const item = await Item.findById(id);
    if (item) {
        item.inStock = inStock === 'true';
        await item.save();
    }
    res.redirect('/admin/panel?section=menu');
};

// GET: Edit Item Page
exports.getEditItem = async (req, res) => {
    const item = await Item.findById(req.params.id);
    if (item) {
        res.render('edit-item', { item, user: req.user });
    } else {
        res.redirect('/admin/panel');
    }
};

// POST: Update Item
exports.updateItem = async (req, res) => {
    const { id } = req.params;
    const { name, price, description, isVeg } = req.body;
    
    const item = await Item.findById(id);
    if (item) {
        item.name = name;
        item.price = parseFloat(price);
        item.description = description;
        item.isVeg = isVeg === 'on';
        if (req.body.image) item.image = req.body.image;
        await item.save();
    }
    res.redirect('/admin/panel?section=menu');
};

// POST: Update Order Status
exports.updateOrderStatus = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    const validStatuses = ['Pending', 'Preparing', 'Completed', 'Delivered'];
    
    if (!validStatuses.includes(status)) {
        return res.redirect('/admin/panel?section=orders');
    }
    
    const order = await Order.findById(orderId);
    if (order) {
        // Prevent changing status if order is already delivered
        if (order.status === 'Delivered') {
            return res.redirect('/admin/panel?section=orders');
        }
        
        order.status = status;
        // order.updatedAt = new Date().toISOString(); // Mongoose handles timestamps if timestamps: true is in schema
        await order.save();
    }
    
    res.redirect('/admin/panel?section=orders');
};

