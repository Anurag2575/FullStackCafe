const {
    getAllItems,
    getAllUsers,
    getAllOrders,
    getUserById,
    updateUser,
    createItem,
    getItemById,
    updateItem,
    getOrderById,
    updateOrder
} = require('../storage');

// Helper to determine current section
const getCurrentSection = (req) => {
  let section = req.query.section || req.body.section || (req.headers.referer ? req.headers.referer.split('section=')[1]?.split('&')[0] : null) || 'overview';
  if (['menu', 'orders', 'users', 'delivered'].includes(section)) {
    return section;
  }
  return 'overview';
};

// GET: Admin Panel (formerly dashboard)
exports.getAdminDashboard = async (req, res) => {
    const users = await getAllUsers();
    const orders = await getAllOrders();
    const activeOrders = orders.filter(o => o.status !== 'Delivered');
    console.log('Active orders sample totals:', activeOrders.slice(0,3).map(o => ({id: o._id.toString().substring(0,8), total: typeof o.total + '=' + o.total, status: o.status})));
    const items = await getAllItems();
    const section = getCurrentSection(req);
    res.render('admin-panel', { users, orders, items, user: req.user, section });
};

// POST: Toggle User Active Status (Student only)
exports.toggleUserActive = async (req, res) => {
    const { id } = req.params;
    const user = await getUserById(id);
    if (user && user.role === 'Student') {
        await updateUser(id, { isActive: !user.isActive });
    }
    const section = 'users';
    res.redirect(`/admin/panel?section=${section}`);
};


// POST: Add New Item
exports.addItem = async (req, res) => {
    try {
        const { name, price, description, isVeg } = req.body;
        const image = req.file ? `/images/${req.file.filename}` : null;
        await createItem({
            name,
            price: parseFloat(price),
            description,
            isVeg: isVeg === 'on',
            image
        });
const section = 'menu';
        res.redirect(`/admin/panel?section=${section}`);
    } catch (error) {
        console.error('Add item error:', error);
        const section = 'menu';
        res.redirect(`/admin/panel?section=${section}`);
    }
};


// POST: Update Item Stock Status
exports.updateItemStock = async (req, res) => {
    const { id } = req.params;
    const { inStock } = req.body; // Expects 'true' or 'false'
    
    const item = await getItemById(id);
    if (item) {
        await updateItem(id, { inStock: inStock === 'true' });
    }
    const section = 'menu';
    res.redirect(`/admin/panel?section=${section}`);
};


// GET: Edit Item Page
exports.getEditItem = async (req, res) => {
    const item = await getItemById(req.params.id);
    if (item) {
        res.render('edit-item', { item, user: req.user });
    } else {
        const section = 'menu';
        res.redirect(`/admin/panel?section=${section}`);
    }
};


// POST: Update Item
exports.updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, description, isVeg } = req.body;
        
        const item = await getItemById(id);
        if (item) {
            const updates = {
                name,
                price: parseFloat(price),
                description,
                isVeg: isVeg === 'on'
            };
            if (req.file) updates.image = `/images/${req.file.filename}`;
            await updateItem(id, updates);
        }
        const section = 'menu';
        res.redirect(`/admin/panel?section=${section}`);
    } catch (error) {
        console.error('Update item error:', error);
        const section = 'menu';
        res.redirect(`/admin/panel?section=${section}`);
    }
};


// POST: Update Order Status
exports.updateOrderStatus = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    const validStatuses = ['Pending', 'Preparing', 'Completed', 'Delivered'];
    
    const section = 'orders';
    if (!validStatuses.includes(status)) {
        return res.redirect(`/admin/panel?section=${section}`);
    }
    
    const order = await getOrderById(orderId);
    if (order) {
        // Prevent changing status if order is already delivered
        if (order.status === 'Delivered') {
            return res.redirect(`/admin/panel?section=${section}`);
        }
        
        await updateOrder(orderId, { status });
    }
    
    res.redirect(`/admin/panel?section=${section}`);
};


