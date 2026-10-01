const axios = require('axios');

const getBkashToken = async () => {
  try {
    const response = await axios.post(
      `${process.env.BKASH_BASE_URL}/tokenized/checkout/token/grant`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          username: process.env.BKASH_USERNAME,
          password: process.env.BKASH_PASSWORD,
        },
        auth: {
          username: process.env.BKASH_APP_KEY,
          password: process.env.BKASH_APP_SECRET,
        },
      }
    );
    return response.data.id_token;
  } catch (error) {
    console.error('bKash Token Generation Error:', error.response?.data || error.message);
    throw new Error('bKash Authentication Failed');
  }
};

const createBkashPayment = async (amount, orderId) => {
  try {
    const token = await getBkashToken();
    const response = await axios.post(
      `${process.env.BKASH_BASE_URL}/tokenized/checkout/create`,
      {
        mode: '0011',
        payerReference: 'aurascents Customer',
        callbackURL: 'http://localhost:5000/api/payments/bkash/callback',
        amount: amount.toString(),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: `INV-${orderId}-${Date.now()}`
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          authorization: token,
          'x-app-key': process.env.BKASH_APP_KEY,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('bKash Create Payment Error:', error.response?.data || error.message);
    throw new Error('bKash Payment Initialization Failed');
  }
};

const executeBkashPayment = async (paymentID) => {
  try {
    const token = await getBkashToken();
    const response = await axios.post(
      `${process.env.BKASH_BASE_URL}/tokenized/checkout/execute`,
      { paymentID },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          authorization: token,
          'x-app-key': process.env.BKASH_APP_KEY,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('bKash Execute Payment Error:', error.response?.data || error.message);
    throw new Error('bKash Payment Execution Failed');
  }
};

module.exports = { createBkashPayment, executeBkashPayment };