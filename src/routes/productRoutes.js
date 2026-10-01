const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const upload = require('../services/uploadService');

router.route('/').get(getProducts).post(protect, admin, upload.array('images', 6), createProduct);
router.route('/:id').get(getProductById).put(protect, admin, upload.array('images', 6), updateProduct).delete(protect, admin, deleteProduct);

module.exports = router;