const mongoose = require('mongoose');

const productVariantSchema = new mongoose.Schema({
  size: { type: String, required: true }, // e.g. '5ml', '10ml', '15ml', '30ml', '50ml', 'Full Bottle'
  bottleVolume: { type: String, default: '' }, // e.g. '100ml' if Full Bottle
  price: { type: Number, required: true },
  discountPrice: { type: Number, default: 0 },
  stock: { type: Number, required: true, default: 0 },
  sku: { type: String, default: '' },
  isAvailable: { type: Boolean, default: true }
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    brand: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    gender: { type: String, enum: ['Men', 'Women', 'Unisex'], default: 'Unisex' },
    fragranceType: { type: String, default: 'Eau de Parfum' },
    longevity: { type: String, default: 'Long Lasting (6-8 hours)' },
    sillage: { type: String, default: 'Moderate' },
    topNotes: [{ type: String }],
    heartNotes: [{ type: String }],
    baseNotes: [{ type: String }],
    variants: [productVariantSchema],
    images: [{ type: String, required: true }],
    tags: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);