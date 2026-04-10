const router = require('express').Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const categoryController = require('../controllers/categoryController');

router.get('/', categoryController.getCategories);
router.post('/', verifyToken, isAdmin, categoryController.createCategory);
router.put('/:id', verifyToken, isAdmin, categoryController.updateCategory);
router.delete('/:id', verifyToken, isAdmin, categoryController.deleteCategory);

module.exports = router;
