

const express = require('express');
const router = express.Router();
const validateSellerInput = require('../middleware/validateSellerInput');
const {
  registerSeller,
  loginSeller,
  forgotPassword,
  resetPassword,
} = require('../controllers/sellerAuthController');


router.post('/register', registerSeller);
router.post('/login', loginSeller); 
router.post('/seller/forgot-password', (req, res, next) => {
  console.log("✅ /seller/forgot-password route hit");
  next();
}, forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
