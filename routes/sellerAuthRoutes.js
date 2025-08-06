

const express = require('express');
const router = express.Router();
const validateSellerInput = require('../middleware/validateSellerInput');
const { registerSeller, loginSeller,forgotPassword, resetPassword } = require('../controllers/sellerAuthController');


router.post('/register', validateSellerInput, registerSeller);
router.post('/login', loginSeller); 
router.post('/seller/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
