const Wishlist = require('../models/Wishlist');
const ProductAnalytics = require('../models/ProductAnalytics');

const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products', 'name brand images variants');
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [productId] });
      await ProductAnalytics.findOneAndUpdate({ product: productId }, { $inc: { wishlistCount: 1 } }, { upsert: true });
    } else {
      const exists = wishlist.products.includes(productId);
      if (exists) {
        wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
        await ProductAnalytics.findOneAndUpdate({ product: productId }, { $inc: { wishlistCount: -1 } }, { upsert: true });
      } else {
        wishlist.products.push(productId);
        await ProductAnalytics.findOneAndUpdate({ product: productId }, { $inc: { wishlistCount: 1 } }, { upsert: true });
      }
      await wishlist.save();
    }

    const updatedWishlist = await Wishlist.findOne({ user: req.user._id }).populate('products', 'name brand images variants');
    res.json(updatedWishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getWishlist, toggleWishlist };