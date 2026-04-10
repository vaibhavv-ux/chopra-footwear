const router = require('express').Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const couponController = require('../controllers/couponController');

router.post('/validate', verifyToken, couponController.validateCoupon);
router.post('/', verifyToken, isAdmin, couponController.createCoupon);
router.get('/', verifyToken, isAdmin, couponController.getCoupons);
router.delete('/:id', verifyToken, isAdmin, couponController.deleteCoupon);

module.exports = router;
