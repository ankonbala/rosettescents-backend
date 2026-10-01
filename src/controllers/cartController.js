const Cart = require('../models/Cart');
const ProductAnalytics = require('../models/ProductAnalytics');

// =====================================================
// GET CART
// =====================================================

const getCart = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }

    let cart = await Cart.findOne({
      user: req.user._id
    }).populate(
      'items.product',
      'name brand images'
    );

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: []
      });
    }

    res.status(200).json(cart);

  } catch (error) {
    console.error('GET CART ERROR:', error);

    res.status(500).json({
      message: error.message
    });
  }
};


// =====================================================
// ADD TO CART
// =====================================================

const addToCart = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }

    const {
      productId,
      variantId,
      size,
      bottleVolume,
      price,
      quantity
    } = req.body;

    // Validate product
    if (!productId) {
      return res.status(400).json({
        message: 'Product ID is required'
      });
    }

    // Variant ID is optional
    // কারণ তোমার frontend-এর কিছু product-এ
    // variantId না-ও থাকতে পারে.

    let cart = await Cart.findOne({
      user: req.user._id
    });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: []
      });
    }

    // =================================================
    // FIND EXISTING ITEM
    // =================================================

    const itemIndex = cart.items.findIndex(item => {

      const sameProduct =
        item.product?.toString() ===
        productId.toString();

      const sameVariant =
        variantId
          ? item.variantId?.toString() ===
            variantId.toString()
          : item.size === size;

      return sameProduct && sameVariant;
    });


    // =================================================
    // UPDATE EXISTING ITEM
    // =================================================

    if (itemIndex > -1) {

      cart.items[itemIndex].quantity =
        Number(
          cart.items[itemIndex].quantity || 0
        ) +
        Number(quantity || 1);

    }

    // =================================================
    // ADD NEW ITEM
    // =================================================

    else {

      const newItem = {
        product: productId,
        size: size || '',
        bottleVolume:
          bottleVolume || '',
        price: Number(price || 0),
        quantity: Number(quantity || 1)
      };

      // Only add variantId if available
      if (variantId) {
        newItem.variantId = variantId;
      }

      cart.items.push(newItem);
    }


    // =================================================
    // SAVE
    // =================================================

    await cart.save();


    // =================================================
    // ANALYTICS
    // =================================================

    try {

      await ProductAnalytics.findOneAndUpdate(
        { product: productId },
        {
          $inc: {
            addedToCart: 1
          }
        },
        {
          upsert: true,
          new: true
        }
      );

    } catch (analyticsError) {

      console.error(
        'CART ANALYTICS ERROR:',
        analyticsError.message
      );

    }


    // =================================================
    // RETURN UPDATED CART
    // =================================================

    const updatedCart =
      await Cart.findOne({
        user: req.user._id
      }).populate(
        'items.product',
        'name brand images'
      );

    res.status(200).json(updatedCart);

  } catch (error) {

    console.error(
      'ADD TO CART ERROR:',
      error
    );

    res.status(500).json({
      message: error.message
    });
  }
};


// =====================================================
// REMOVE FROM CART
// =====================================================

const removeFromCart = async (req, res) => {
  try {

    if (!req.user) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }

    const { itemId } = req.params;

    const cart = await Cart.findOne({
      user: req.user._id
    });

    if (!cart) {
      return res.status(404).json({
        message: 'Cart not found'
      });
    }


    // =================================================
    // FIND ITEM
    // =================================================

    const item = cart.items.id(itemId);


    // =================================================
    // ANALYTICS
    // =================================================

    if (item) {

      try {

        await ProductAnalytics.findOneAndUpdate(
          { product: item.product },
          {
            $inc: {
              removedFromCart: 1
            }
          },
          {
            upsert: true,
            new: true
          }
        );

      } catch (analyticsError) {

        console.error(
          'REMOVE CART ANALYTICS ERROR:',
          analyticsError.message
        );

      }

    }


    // =================================================
    // REMOVE
    // =================================================

    cart.items =
      cart.items.filter(
        item =>
          item._id.toString() !==
          itemId
      );

    await cart.save();


    // =================================================
    // UPDATED CART
    // =================================================

    const updatedCart =
      await Cart.findOne({
        user: req.user._id
      }).populate(
        'items.product',
        'name brand images'
      );

    res.status(200).json(updatedCart);

  } catch (error) {

    console.error(
      'REMOVE CART ERROR:',
      error
    );

    res.status(500).json({
      message: error.message
    });
  }
};


// =====================================================
// CLEAR CART
// =====================================================

const clearCart = async (req, res) => {
  try {

    if (!req.user) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }

    const cart = await Cart.findOne({
      user: req.user._id
    });

    if (cart) {

      cart.items = [];

      await cart.save();

    }

    res.status(200).json({
      message: 'Cart cleared'
    });

  } catch (error) {

    console.error(
      'CLEAR CART ERROR:',
      error
    );

    res.status(500).json({
      message: error.message
    });
  }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  clearCart
};