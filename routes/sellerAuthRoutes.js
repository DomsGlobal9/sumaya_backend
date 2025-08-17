

const express = require('express');
const router = express.Router();
const validateSellerInput = require('../middleware/validateSellerInput');
const { registerSeller, loginSeller,forgotPassword, resetPassword } = require('../controllers/sellerAuthController');
const checkAuth = require('../middleware/checkAuth');

router.post('/register', validateSellerInput, registerSeller);
router.post('/login', loginSeller); 
router.post('/seller/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/check-auth', checkAuth, (req, res) => {
  res.json({ message: 'You are authenticated', user: req.user });
});


module.exports = router;
