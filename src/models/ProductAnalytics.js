const mongoose = require('mongoose');

const productAnalyticsSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
    views: { type: Number, default: 0 },
    addedToCart: { type: Number, default: 0 },
    removedFromCart: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
    wishlistCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProductAnalytics', productAnalyticsSchema);