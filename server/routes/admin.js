const router = require('express').Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

router.get('/dashboard', verifyToken, isAdmin, adminController.getDashboard);
router.get('/users', verifyToken, isAdmin, adminController.getUsers);
router.put('/users/:id', verifyToken, isAdmin, adminController.updateUserRole);
router.get('/inventory', verifyToken, isAdmin, adminController.getInventory);

// Profile (any logged in user)
router.put('/profile', verifyToken, adminController.updateProfile);

// Recently viewed
router.post('/recently-viewed', verifyToken, adminController.addRecentlyViewed);
router.get('/recently-viewed', verifyToken, adminController.getRecentlyViewed);

module.exports = router;
