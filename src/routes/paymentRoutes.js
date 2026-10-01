const express = require('express');
const router = express.Router();
const { initiateBkash, bkashCallback } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/bkash/initiate', protect, initiateBkash);
router.get('/bkash/callback', bkashCallback);

module.exports = router;