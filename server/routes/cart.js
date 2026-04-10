const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const cartController = require('../controllers/cartController');

router.get('/', verifyToken, cartController.getCart);
router.post('/', verifyToken, cartController.addToCart);
router.post('/merge', verifyToken, cartController.mergeCart);
router.put('/:id', verifyToken, cartController.updateCartItem);
router.delete('/:id', verifyToken, cartController.removeCartItem);
router.delete('/', verifyToken, cartController.clearCart);

module.exports = router;
