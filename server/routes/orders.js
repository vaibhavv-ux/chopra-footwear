const router = require('express').Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

router.post('/', verifyToken, orderController.placeOrder);
router.get('/my', verifyToken, orderController.getMyOrders);
router.get('/:id', verifyToken, orderController.getOrder);
router.get('/', verifyToken, isAdmin, orderController.getAllOrders);
router.put('/:id/status', verifyToken, isAdmin, orderController.updateOrderStatus);

module.exports = router;
