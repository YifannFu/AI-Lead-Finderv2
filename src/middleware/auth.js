const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    // Public beta mode: allow unauthenticated access by attaching a demo user
    if (!token && process.env.PUBLIC_BETA === 'true') {
      const demoEmail = 'demo@beta.local';
      let demoUser = await User.findOne({ email: demoEmail });
      if (!demoUser) {
        demoUser = await User.create({
          firstName: 'Demo',
          lastName: 'User',
          email: demoEmail,
          password: 'demo-password',
          company: '',
          industry: 'Technology'
        });
      }
      req.user = demoUser;
      return next();
    }
    
    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Invalid token or user not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      error: 'Access denied',
      message: 'Invalid token'
    });
  }
};

module.exports = authMiddleware;
