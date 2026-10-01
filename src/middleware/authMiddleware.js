const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Not authorized, no token'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'Not authorized, no token'
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id)
      .select('-password');

    if (!user) {
      return res.status(401).json({
        message: 'User not found. Please login again.'
      });
    }

    req.user = user;

    next();

  } catch (error) {
    console.error('AUTH ERROR:', error.message);

    return res.status(401).json({
      message: 'Not authorized, token failed'
    });
  }
};

module.exports = { protect };