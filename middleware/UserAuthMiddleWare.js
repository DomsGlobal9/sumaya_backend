// const jwt = require('jsonwebtoken');
// const User = require('../models/UserModel');

// const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// const UserauthMiddleware = async (req, res, next) => {
//   try {
//     const authHeader = req.header('Authorization');
//     console.log(authHeader,"headert");
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res.status(401).json({ 
//         success: false,
//         message: 'No token, authorization denied' 
//       });
//     }

//     const token = authHeader.replace('Bearer ', '');
//     const decoded = jwt.verify(token, JWT_SECRET);
    
//     const user = await User.findById(decoded.id);
//     if (!user) {
//       return res.status(401).json({ 
//         success: false,
//         message: 'Invalid token - user not found' 
//       });
//     }

//     req.user = user; // This is what your controller expects
//     next();
//   } catch (error) {
//     console.error('Auth middleware error:', error);
//     res.status(401).json({ 
//       success: false,
//       message: 'Token is not valid',
//       error: error.message 
//     });
//   }
// };

// module.exports = UserauthMiddleware;


const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

const UserauthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    console.log(authHeader, "header");
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'No token, authorization denied' 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token - user not found' 
      });
    }

    req.user = user; // Set req.user._id to match controller expectations
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token has expired after 7 days. Please log in again.',
        error: error.message 
      });
    }
    res.status(401).json({ 
      success: false,
      message: 'Token is not valid',
      error: error.message 
    });
  }
};

module.exports = UserauthMiddleware;