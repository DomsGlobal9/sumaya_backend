// const jwt = require('jsonwebtoken');

// const checkAuth = (req, res, next) => {
//   const token = req.cookies.token; // Read from httpOnly cookie

//   if (!token) {
//     return res.status(401).json({ message: 'Unauthorized: No token' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // attach user to request
//     next();
//   } catch (err) {
//     return res.status(403).json({ message: 'Invalid token' });
//   }
// };

// module.exports = checkAuth;

// middleware/checkAuth.js
const jwt = require('jsonwebtoken');

const checkAuth = (req, res, next) => {
  try {
    let token = req.header('Authorization');
    
    if (token && token.startsWith('Bearer ')) {
      token = token.slice(7);
      console.log(token)
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = checkAuth;