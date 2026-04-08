const orderService = require('../services/order.service');
const { ApiResponse } = require('../../../utils/ApiResponse');

exports.initiatePayment = async (req, res, next) => {
  try {
    const { cart, customerInfo } = req.body;
    
    // We send the data to service to get the token
    const result = await orderService.createSnapToken(cart, customerInfo);

    res.status(200).json(
      new ApiResponse(200, result, 'Token created')
    );
  } catch (e) {
    next(e);
  }
};

// WEBHOOK HANDLER (For when payment is finished)
exports.handleWebhook = async (req, res, next) => {
  try {
    const statusResponse = req.body;

    // 1. Verify and Process (Await the service)
    const result = await orderService.verifyWebhook(statusResponse);

    // 2. Log the professional output
    console.log(`[MIDTRANS WEBHOOK] ${result.message}`);

    // 3. Since you have no DB, this is where you would trigger 
    // real-time events (like Socket.io) or send an automated email.
    
    // 4. Respond to Midtrans immediately (200 OK)
    // If you don't send this, Midtrans will keep spamming your server for 24 hours.
    res.status(200).json({
      success: true,
      message: 'Notification handled'
    });

  } catch (e) {
    console.error(`[WEBHOOK ERROR] ${e.message}`);
    // We still return 200/400 but log the error so Midtrans doesn't loop infinitely
    res.status(400).send('Webhook failed'); 
  }
};