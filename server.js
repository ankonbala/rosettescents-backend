const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/db');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');
const { trackVisitor } = require('./src/middleware/visitorTracker');

// Load environment variables
dotenv.config();

// Connect to MongoDB database
connectDB();

const app = express();

// Middleware setup
const allowedOrigins = [
  'http://localhost:5173',
  'https://rosette.website',
  'https://www.rosette.website'];



app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


  
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Visitor tracking middleware
app.use(trackVisitor);

// Static folder for uploaded product images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes Mounting
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/products', require('./src/routes/productRoutes'));
app.use('/api/categories', require('./src/routes/categoryRoutes'));
app.use('/api/cart', require('./src/routes/cartRoutes'));
app.use('/api/wishlist', require('./src/routes/wishlistRoutes'));
app.use('/api/orders', require('./src/routes/orderRoutes'));
app.use('/api/payments', require('./src/routes/paymentRoutes'));
app.use('/api/analytics', require('./src/routes/analyticsRoutes'));

// Root test endpoint
app.get('/', (req, res) => {
  res.json({ message: 'aurascents Perfume API is running successfully...' });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});