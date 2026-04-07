const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected admin routes
// unified admin panel endpoint
router.get('/panel', protect, adminOnly, adminController.getAdminDashboard);

// redirect legacy base path to new panel
router.get('/', protect, adminOnly, (req, res) => res.redirect('/admin/panel'));

// admin actions
router.post('/items/add', protect, adminOnly, require('../middleware/uploadMiddleware'), adminController.addItem);
router.post('/items/:id/stock', protect, adminOnly, adminController.updateItemStock);
router.get('/items/edit/:id', protect, adminOnly, adminController.getEditItem);
router.post('/items/edit/:id', protect, adminOnly, require('../middleware/uploadMiddleware'), adminController.updateItem);
router.post('/orders/:orderId/status', protect, adminOnly, adminController.updateOrderStatus);
router.post('/users/:id/toggle-active', protect, adminOnly, adminController.toggleUserActive);

module.exports = router;
