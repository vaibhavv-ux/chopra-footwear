const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');
const reviewController = require('../controllers/reviewController');

router.get('/:productId', reviewController.getReviews);
router.post('/:productId', verifyToken, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5')
], validate, reviewController.createReview);

module.exports = router;
