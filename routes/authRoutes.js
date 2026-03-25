const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Auth routes
router.get('/login', authController.getLogin);
router.get('/signup', authController.getSignup);
router.post('/auth/signup', authController.postSignup);
router.post('/auth/login', authController.postLogin);
router.get('/logout', authController.getLogout);

// Dashboard (Protected)
router.get('/dashboard', protect, authController.getDashboard);

module.exports = router;
