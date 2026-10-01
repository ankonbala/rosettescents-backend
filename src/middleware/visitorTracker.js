const VisitorAnalytics = require('../models/VisitorAnalytics');

const trackVisitor = async (req, res, next) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    const path = req.originalUrl;
    
    if (!path.startsWith('/api/analytics') && !path.includes('.')) {
      await VisitorAnalytics.create({
        ipAddress: ip,
        userAgent,
        path,
        method: req.method,
        timestamp: new Date()
      });
    }
  } catch (error) {
    console.error('Visitor tracking error:', error);
  }
  next();
};

module.exports = { trackVisitor };