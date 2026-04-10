const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const wishlistController = require('../controllers/wishlistController');

router.get('/', verifyToken, wishlistController.getWishlist);
router.post('/', verifyToken, wishlistController.addToWishlist);
router.delete('/:productId', verifyToken, wishlistController.removeFromWishlist);

module.exports = router;
