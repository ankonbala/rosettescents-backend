const mongoose = require('mongoose');

const visitorAnalyticsSchema = new mongoose.Schema(
  {
    ipAddress: { type: String },
    userAgent: { type: String },
    path: { type: String },
    method: { type: String },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('VisitorAnalytics', visitorAnalyticsSchema);