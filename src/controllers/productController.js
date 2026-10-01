const Product = require('../models/Product');
const ProductAnalytics = require('../models/ProductAnalytics');
const Category = require('../models/Category');

const getProducts = async (req, res) => {
  try {
    const { keyword, category, gender, brand, sort, minPrice, maxPrice } = req.query;
    let query = {};

    if (keyword) {
      query.$or = [
        { name: { $regex: keyword,$options: 'i' } },
        { brand: { $regex: keyword,$options: 'i' } },
        { fragranceType: { $regex: keyword,$options: 'i' } },
        { tags: { $in: [new RegExp(keyword, 'i')] } },
        { topNotes: { $in: [new RegExp(keyword, 'i')] } }
      ];
    }

    if (category) query.category = category;
    if (gender) query.gender = gender;
    if (brand) query.brand = brand;

    let productsQuery = Product.find(query).populate('category', 'name slug');

    if (sort === 'lowest') productsQuery = productsQuery.sort({ 'variants.price': 1 });
    else if (sort === 'highest') productsQuery = productsQuery.sort({ 'variants.price': -1 });
    else if (sort === 'toprated') productsQuery = productsQuery.sort({ rating: -1 });
    else productsQuery = productsQuery.sort({ createdAt: -1 });

    const products = await productsQuery;
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (product) {
      // Track View Event
      await ProductAnalytics.findOneAndUpdate(
        { product: product._id },
        { $inc: { views: 1 } },
        { upsert: true, new: true }
      );
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      name, brand, description, category, gender, fragranceType,
      longevity, sillage, topNotes, heartNotes, baseNotes,
      variants, tags, isFeatured, isBestSeller, isNewArrival
    } = req.body;

    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now();

    // Safe Category Handling
    let categoryId = category;
    if (!categoryId || categoryId.length < 12) {
      let defaultCat = await Category.findOne({ name: 'Perfume' });
      if (!defaultCat) {
        defaultCat = await Category.create({ name: 'Perfume', slug: 'perfume' });
      }
      categoryId = defaultCat._id;
    }

    const product = await Product.create({
      name, 
      brand, 
      slug, 
      description, 
      category: categoryId, 
      gender: gender || 'Unisex',
      fragranceType: fragranceType || 'Eau de Parfum', 
      longevity, 
      sillage,
      topNotes: topNotes ? JSON.parse(topNotes) : [],
      heartNotes: heartNotes ? JSON.parse(heartNotes) : [],
      baseNotes: baseNotes ? JSON.parse(baseNotes) : [],
      variants: variants ? JSON.parse(variants) : [],
      images,
      tags: tags ? JSON.parse(tags) : [],
      isFeatured: isFeatured === 'true',
      isBestSeller: isBestSeller === 'true',
      isNewArrival: isNewArrival === 'true'
    });

    await ProductAnalytics.create({ product: product._id });
    res.status(201).json(product);
  } catch (error) {
    console.error("Product Creation Error Details:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.name = req.body.name || product.name;
    product.brand = req.body.brand || product.brand;
    product.description = req.body.description || product.description;
    product.category = req.body.category || product.category;
    product.gender = req.body.gender || product.gender;
    product.fragranceType = req.body.fragranceType || product.fragranceType;
    product.longevity = req.body.longevity || product.longevity;
    product.sillage = req.body.sillage || product.sillage;
    
    if (req.body.topNotes) product.topNotes = JSON.parse(req.body.topNotes);
    if (req.body.heartNotes) product.heartNotes = JSON.parse(req.body.heartNotes);
    if (req.body.baseNotes) product.baseNotes = JSON.parse(req.body.baseNotes);
    if (req.body.variants) product.variants = JSON.parse(req.body.variants);
    if (req.body.tags) product.tags = JSON.parse(req.body.tags);

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      product.images = [...product.images, ...newImages];
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await product.deleteOne();
    await ProductAnalytics.deleteOne({ product: req.params.id });
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };