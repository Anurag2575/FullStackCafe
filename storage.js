const mongoose = require('mongoose');
const Item = require('./models/Item');
const User = require('./models/User');
const Order = require('./models/Order');

const createId = () => new mongoose.Types.ObjectId().toString();

const toPlain = (doc) => {
    if (!doc) return null;

    if (typeof doc.toObject === 'function') {
        const plain = doc.toObject({ virtuals: true });
        plain.id = plain.id || plain._id?.toString();
        return plain;
    }

    const cloned = JSON.parse(JSON.stringify(doc));
    cloned.id = cloned.id || cloned._id?.toString();
    return cloned;
};

const sortNewestFirst = (items) =>
    [...items].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

const seedItems = [
    {
        _id: createId(),
        name: 'Masala Chai',
        price: 40,
        description: 'Spiced tea brewed strong and served hot.',
        isVeg: true,
        image: '/images/chai.jpg',
        inStock: true,
        createdAt: new Date('2026-01-01T09:00:00.000Z')
    },
    {
        _id: createId(),
        name: 'Masala Dosa',
        price: 120,
        description: 'Crispy dosa with potato masala and chutneys.',
        isVeg: true,
        image: '/images/dosa.jpg',
        inStock: true,
        createdAt: new Date('2026-01-02T09:00:00.000Z')
    },
    {
        _id: createId(),
        name: 'Veg Sandwich',
        price: 90,
        description: 'Toasted sandwich loaded with fresh vegetables.',
        isVeg: true,
        image: '/images/sandwich.jpg',
        inStock: true,
        createdAt: new Date('2026-01-03T09:00:00.000Z')
    },
    {
        _id: createId(),
        name: 'Paneer Wrap',
        price: 140,
        description: 'Soft wrap filled with spiced paneer and salad.',
        isVeg: true,
        image: '/images/wrap.jpg',
        inStock: true,
        createdAt: new Date('2026-01-04T09:00:00.000Z')
    },
    {
        _id: createId(),
        name: 'Veg Biryani',
        price: 180,
        description: 'Fragrant basmati rice layered with vegetables.',
        isVeg: true,
        image: '/images/biryani.jpg',
        inStock: true,
        createdAt: new Date('2026-01-05T09:00:00.000Z')
    },
    {
        _id: createId(),
        name: 'Fried Rice',
        price: 150,
        description: 'Wok-tossed rice with vegetables and savory spices.',
        isVeg: true,
        image: '/images/fried-rice.jpg',
        inStock: true,
        createdAt: new Date('2026-01-06T09:00:00.000Z')
    },
    {
        _id: createId(),
        name: 'Idli Plate',
        price: 80,
        description: 'Soft idlis served with sambhar and chutney.',
        isVeg: true,
        image: '/images/idli.jpg',
        inStock: true,
        createdAt: new Date('2026-01-07T09:00:00.000Z')
    },
    {
        _id: createId(),
        name: 'Lime Soda',
        price: 60,
        description: 'Refreshing lime soda with a fizzy finish.',
        isVeg: true,
        image: '/images/lime-soda.jpg',
        inStock: true,
        createdAt: new Date('2026-01-08T09:00:00.000Z')
    }
].map((item) => ({ ...item, id: item._id }));

const memory = {
    items: [...seedItems],
    users: [],
    orders: []
};

const isDbAvailable = () => mongoose.connection.readyState === 1;

const maybePopulateOrderUser = async (order) => {
    const plain = toPlain(order);
    if (!plain) return null;

    if (plain.userId && typeof plain.userId === 'string') {
        const user = await getUserById(plain.userId);
        plain.userId = user || null;
    }

    return plain;
};

async function getAllItems() {
    if (isDbAvailable()) {
        const items = await Item.find().sort({ createdAt: -1 });
        return items.map(toPlain);
    }

    return sortNewestFirst(memory.items).map(toPlain);
}

async function getItemById(id) {
    if (isDbAvailable()) {
        return toPlain(await Item.findById(id));
    }

    return toPlain(memory.items.find((item) => item._id === id || item.id === id));
}

async function createItem(data) {
    if (isDbAvailable()) {
        return toPlain(await Item.create(data));
    }

    const item = {
        _id: createId(),
        ...data,
        inStock: typeof data.inStock === 'boolean' ? data.inStock : true,
        createdAt: new Date()
    };
    item.id = item._id;
    memory.items.unshift(item);
    return toPlain(item);
}

async function updateItem(id, updates) {
    if (isDbAvailable()) {
        const item = await Item.findById(id);
        if (!item) return null;
        Object.assign(item, updates);
        await item.save();
        return toPlain(item);
    }

    const item = memory.items.find((entry) => entry._id === id || entry.id === id);
    if (!item) return null;
    Object.assign(item, updates);
    return toPlain(item);
}

async function getAllUsers() {
    if (isDbAvailable()) {
        const users = await User.find().sort({ createdAt: -1 });
        return users.map(toPlain);
    }

    return sortNewestFirst(memory.users).map(toPlain);
}

async function findUserByEmail(email) {
    if (isDbAvailable()) {
        return toPlain(await User.findOne({ email }));
    }

    return toPlain(memory.users.find((user) => user.email.toLowerCase() === String(email).toLowerCase()));
}

async function getUserById(id) {
    if (isDbAvailable()) {
        return toPlain(await User.findById(id));
    }

    return toPlain(memory.users.find((user) => user._id === id || user.id === id));
}

async function createUser(data) {
    if (isDbAvailable()) {
        return toPlain(await User.create(data));
    }

    const user = {
        _id: createId(),
        role: 'Student',
        isActive: true,
        walletBalance: 0,
        createdAt: new Date(),
        ...data
    };
    user.id = user._id;
    memory.users.unshift(user);
    return toPlain(user);
}

async function updateUser(id, updates) {
    if (isDbAvailable()) {
        const user = await User.findById(id);
        if (!user) return null;
        Object.assign(user, updates);
        await user.save();
        return toPlain(user);
    }

    const user = memory.users.find((entry) => entry._id === id || entry.id === id);
    if (!user) return null;
    Object.assign(user, updates);
    return toPlain(user);
}

async function getAllOrders() {
    if (isDbAvailable()) {
        const orders = await Order.find({}).populate('userId').sort({ createdAt: -1 });
        return orders.map(toPlain);
    }

    const orders = await Promise.all(sortNewestFirst(memory.orders).map(maybePopulateOrderUser));
    return orders;
}

async function getOrdersByUserId(userId) {
    if (isDbAvailable()) {
        const orders = await Order.find({ userId }).populate('userId').sort({ createdAt: -1 });
        return orders.map(toPlain);
    }

    const orders = memory.orders.filter((order) => order.userId === userId);
    return Promise.all(sortNewestFirst(orders).map(maybePopulateOrderUser));
}

async function getOrderById(id) {
    if (isDbAvailable()) {
        return toPlain(await Order.findById(id).populate('userId'));
    }

    return maybePopulateOrderUser(memory.orders.find((order) => order._id === id || order.id === id));
}

async function createOrder(data) {
    if (isDbAvailable()) {
        return toPlain(await Order.create(data));
    }

    const order = {
        _id: createId(),
        createdAt: new Date(),
        status: 'Pending',
        ...data
    };
    order.id = order._id;
    memory.orders.unshift(order);
    return toPlain(order);
}

async function updateOrder(id, updates) {
    if (isDbAvailable()) {
        const order = await Order.findById(id);
        if (!order) return null;
        Object.assign(order, updates);
        await order.save();
        return toPlain(order);
    }

    const order = memory.orders.find((entry) => entry._id === id || entry.id === id);
    if (!order) return null;
    Object.assign(order, updates, { updatedAt: new Date() });
    return toPlain(order);
}

module.exports = {
    isDbAvailable,
    getAllItems,
    getItemById,
    createItem,
    updateItem,
    getAllUsers,
    findUserByEmail,
    getUserById,
    createUser,
    updateUser,
    getAllOrders,
    getOrdersByUserId,
    getOrderById,
    createOrder,
    updateOrder
};
