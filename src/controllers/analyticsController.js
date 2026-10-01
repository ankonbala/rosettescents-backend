const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const VisitorAnalytics = require('../models/VisitorAnalytics');
const ProductAnalytics = require('../models/ProductAnalytics');

const getDashboardAnalytics = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await User.countDocuments({ isAdmin: false });
    const totalVisitors = await VisitorAnalytics.countDocuments();

    const orders = await Order.find({});
    const totalRevenue = orders.reduce((acc, order) => acc + (order.isPaid ? order.totalPrice : 0), 0);

    const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
    const processingOrders = await Order.countDocuments({ orderStatus: 'Processing' });
    const shippedOrders = await Order.countDocuments({ orderStatus: 'Shipped' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'Delivered' });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'Cancelled' });

    // Today's metrics
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayOrdersList = await Order.find({ createdAt: { $gte: startOfDay } });
    const todaysOrders = todayOrdersList.length;
    const todaysRevenue = todayOrdersList.reduce((acc, order) => acc + (order.isPaid ? order.totalPrice : 0), 0);
    const todaysVisitors = await VisitorAnalytics.countDocuments({ timestamp: { $gte: startOfDay } });

    // Product Level Analytics
    const productAnalytics = await ProductAnalytics.find({})
      .populate('product', 'name brand images')
      .sort({ views: -1 });

    res.json({
      totalRevenue,
      totalOrders,
      totalProducts,
      totalCustomers,
      totalVisitors,
      todaysVisitors,
      todaysOrders,
      todaysRevenue,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      productAnalytics
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardAnalytics };