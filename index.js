const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();
const mongoose = require('mongoose');
const { getUserById } = require('./storage');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const cartViewRoutes = require('./routes/cartViewRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
// import authentication middleware that handles both JWT and session
const { protect } = require('./middleware/authMiddleware');

const app = express();
mongoose.set('bufferCommands', false);

// Database Connection with retry & local default
const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fullstack-cafe';

// Startup function - connect DB then listen
// All middleware and routes first
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());
app.use(session({
    secret: process.env.JWT_SECRET || 'secret123',
    resave: false,
    saveUninitialized: true
}));

// --- Image Upload Configuration ---
// Ensure public/images directory exists
const publicDir = path.join(__dirname, 'public');
const imagesDir = path.join(publicDir, 'images');

if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
}
// If 'images' exists as a file, delete it so we can make the folder
if (fs.existsSync(imagesDir) && !fs.lstatSync(imagesDir).isDirectory()) {
    fs.unlinkSync(imagesDir);
}
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imagesDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Middleware to inject image path into req.body for the controller
const handleImageUpload = (req, res, next) => {
    if (req.file) {
        req.body.image = '/images/' + req.file.filename;
    }
    next();
};

// Flash message support
app.use((req, res, next) => {
    if (req.session && req.session.message) {
        res.locals.message = req.session.message;
        delete req.session.message;
    } else {
        res.locals.message = null;
    }
    next();
});

// Middleware to make user and cart available to all templates
app.use(async (req, res, next) => {
    res.locals.cart = req.session.cart || [];
    res.locals.user = req.session?.userId ? await getUserById(req.session.userId) : null;
    next();
});


// Routes
app.use('/', authRoutes);
app.use('/', productRoutes);
app.use('/cart', cartRoutes);
app.use('/cart', cartViewRoutes);
app.use('/order', protect, orderRoutes);
app.use('/admin', adminRoutes);

// Startup function - connect DB then listen
async function startServer() {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.warn('⚠️ MongoDB unavailable - running in memory-only mode');
    console.warn('💡 Core features work. Install DB for full functionality.');
  }
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();
