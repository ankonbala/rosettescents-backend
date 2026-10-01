const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { createBkashPayment, executeBkashPayment } = require('../services/bkashService');

const initiateBkash = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const bkashResponse = await createBkashPayment(order.totalPrice, order._id);
    
    await Payment.create({
      order: order._id,
      user: req.user._id,
      paymentID: bkashResponse.paymentID,
      amount: order.totalPrice,
      gatewayResponse: bkashResponse
    });

    res.json({ bkashURL: bkashResponse.bkashURL });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bkashCallback = async (req, res) => {
  try {
    const { paymentID, status } = req.query;
    if (status === 'success') {
      const executeResponse = await executeBkashPayment(paymentID);
      if (executeResponse.statusCode === '0000') {
        const payment = await Payment.findOne({ paymentID });
        if (payment) {
          payment.status = 'Completed';
          payment.trxID = executeResponse.trxID;
          payment.gatewayResponse = executeResponse;
          await payment.save();

          const order = await Order.findById(payment.order);
          if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
              id: paymentID,
              status: executeResponse.transactionStatus,
              trxID: executeResponse.trxID
            };
            await order.save();
          }
        }
        return res.redirect('http://localhost:5173/order-success?status=success');
      }
    }
    res.redirect('http://localhost:5173/order-success?status=failed');
  } catch (error) {
    res.status(500).redirect('http://localhost:5173/order-success?status=failed');
  }
};

module.exports = { initiateBkash, bkashCallback };