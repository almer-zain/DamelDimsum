const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');

// Route to get the snap token
router.post('/checkout', orderController.initiatePayment);

// Webhook Route (Midtrans calls this)
router.post('/webhook', orderController.handleWebhook);

module.exports = router;