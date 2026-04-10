const { getItemById, getOrdersByUserId } = require('../storage');

const sanitizeText = (...values) => {
    for (const value of values) {
        if (typeof value !== 'string') continue;
        const trimmed = value.trim();
        if (!trimmed) continue;
        if (trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'undefined') continue;
        return trimmed;
    }

    return '';
};

const normalizeId = (value) => {
    if (value === null || value === undefined) return '';
    return String(value).trim();
};

const normalizeCartItem = async (item) => {
    const resolvedItemId = normalizeId(item?.itemId || item?.id || item?.productId);
    const product = resolvedItemId ? await getItemById(resolvedItemId) : null;
    const parsedPrice = Number.parseFloat(item?.price);
    const quantity = Number.isFinite(Number(item?.quantity)) && Number(item.quantity) > 0
        ? Number(item.quantity)
        : 1;
    const resolvedName = sanitizeText(item?.name, product?.name) || 'Unnamed Item';
    const resolvedDescription = sanitizeText(item?.description, product?.description) || 'No description available';

    return {
        itemId: resolvedItemId || normalizeId(product?.id || product?._id),
        name: resolvedName,
        description: resolvedDescription,
        price: Number.isFinite(parsedPrice) ? parsedPrice : Number(product?.price || 0),
        quantity
    };
};

const normalizeCart = async (cart = []) => Promise.all(cart.map(normalizeCartItem));

// POST: Add Item to Cart
exports.addToCart = async (req, res) => {
    const { itemId, name, price, description } = req.body;
    if (!req.session.cart) req.session.cart = [];

    const resolvedItemId = normalizeId(itemId);
    const product = resolvedItemId ? await getItemById(resolvedItemId) : null;
    const resolvedName = sanitizeText(name, product?.name) || 'Unnamed Item';
    const resolvedDescription = sanitizeText(description, product?.description) || 'No description available';
    const parsedPrice = Number.parseFloat(price);
    const resolvedPrice = Number.isFinite(parsedPrice) ? parsedPrice : Number(product?.price || 0);

    const existingItem = req.session.cart.find(item => normalizeId(item.itemId || item.id || item.productId) === resolvedItemId);
    if (existingItem) {
        existingItem.quantity += 1;
        existingItem.itemId = resolvedItemId;
        if (!sanitizeText(existingItem.name)) {
            existingItem.name = resolvedName;
        }
        if (!sanitizeText(existingItem.description)) {
            existingItem.description = resolvedDescription;
        }
        if (!Number.isFinite(Number(existingItem.price))) {
            existingItem.price = resolvedPrice;
        }
    } else {
        req.session.cart.push({
            itemId: resolvedItemId,
            name: resolvedName,
            price: resolvedPrice,
            description: resolvedDescription,
            quantity: 1
        });
    }

    req.session.cart = await normalizeCart(req.session.cart);

    const wantsJson = req.xhr || req.headers.accept?.includes('application/json');
    if (wantsJson) {
        req.session.save(() => {
            const item = req.session.cart.find(item => normalizeId(item.itemId || item.id || item.productId) === resolvedItemId);
            res.json({ success: true, item: { itemId: item.itemId, quantity: item.quantity } });
        });
    } else {
        res.redirect('/#menu');
    }
};

// GET: View Cart (with optional orders tab)
exports.getCart = async (req, res) => {
    const cart = await normalizeCart(req.session.cart || []);
    req.session.cart = cart;
    const total = cart.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.quantity) || 0)), 0);
    
    // if the user is logged in, also fetch their orders to show in a tab
    let activeOrders = [];
    let pastOrders = [];
    if (req.session && req.session.userId) {
        const userId = req.session.userId;
        const allOrders = await getOrdersByUserId(userId);
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
    
    if (req.xhr) {
        req.session.save(() => {
            res.json({ success: true, item: { itemId, quantity: cartItem ? cartItem.quantity : 0 }, message: 'Quantity increased!' });
        });
    } else {
        res.redirect(req.get('referer') || '/');
    }
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
    
    if (req.xhr) {
        req.session.save(() => {
            res.json({ success: true, item: { itemId, quantity: cartItem ? cartItem.quantity : 0 }, message: 'Quantity decreased!' });
        });
    } else {
        res.redirect(req.get('referer') || '/');
    }
};

// POST: Remove Item from Cart
exports.removeFromCart = (req, res) => {
    const { itemId } = req.params;
    if (req.session.cart) {
        req.session.cart = req.session.cart.filter(item => item.itemId !== itemId);
    }
    
    if (req.xhr) {
        req.session.save(() => {
            res.json({ success: true, message: 'Item removed from cart!' });
        });
    } else {
        res.redirect(req.get('referer') || '/');
    }
};
