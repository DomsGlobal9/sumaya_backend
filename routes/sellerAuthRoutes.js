

// const express = require('express');
// const router = express.Router();
// const validateSellerInput = require('../middleware/validateSellerInput');
// const { registerSeller, loginSeller,forgotPassword, resetPassword } = require('../controllers/sellerAuthController');
// const checkAuth = require('../middleware/checkAuth');

// router.post('/register', validateSellerInput, registerSeller);
// router.post('/login', loginSeller); 
// router.post('/seller/forgot-password', forgotPassword);
// router.post('/reset-password', resetPassword);

// router.get('/check-auth', checkAuth, (req, res) => {
//   res.json({ message: 'You are authenticated', user: req.user });
// });


// module.exports = router;

// const express = require('express');
// const router = express.Router();
// const validateSellerInput = require('../middleware/validateSellerInput');
// const { 
//   registerSeller, 
//   loginSeller, 
//   forgotPassword, 
//   resetPassword, 
//   logout,
//   updateProfile,
//   completeProfile,
//   getProfile
// } = require('../controllers/sellerAuthController');
// const checkAuth = require('../middleware/checkAuth');

// // Authentication routes
// router.post('/register', validateSellerInput, registerSeller);
// router.post('/login', loginSeller); 
// router.post('/logout', logout);
// router.post('/seller/forgot-password', forgotPassword);
// router.post('/reset-password', resetPassword);

// // Profile routes (protected)
// router.get('/profile/:id', checkAuth, getProfile);
// router.put('/profile/:id', checkAuth, updateProfile);
// router.post('/complete-profile/:id', checkAuth, completeProfile);

// // Auth check route
// router.get('/check-auth', checkAuth, (req, res) => {
//   res.json({ message: 'You are authenticated', user: req.user });
// });

// module.exports = router;

const mongoose = require("mongoose");
const express = require('express');
const router = express.Router();
const validateSellerInput = require('../middleware/validateSellerInput');
const { 
  registerSeller, 
  loginSeller, 
  forgotPassword, 
  resetPassword, 
  logout,
  updateProfile,
  completeProfile,
  getProfile
} = require('../controllers/sellerAuthController');
const checkAuth = require('../middleware/checkAuth');
const Seller = require('../models/Seller');

// Authentication routes
router.post('/register', validateSellerInput, registerSeller);
router.post('/login', loginSeller); 
router.post('/logout', logout);
router.post('/seller/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Profile routes (protected)
router.get('/profile/:id', checkAuth, getProfile);
router.put('/profile/:id', checkAuth, updateProfile);
router.post('/complete-profile/:id', checkAuth, completeProfile);

// Additional routes for bank details (optional - for specific bank operations)
router.get('/profile/:id/bank-details', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ensure the user can only access their own bank details
    if (req.user.id !== id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const Seller = require('../models/Seller');
    const seller = await Seller.findById(id).select('bankDetails username shopName email');
    
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    // Return unmasked data for owner
    const sellerData = seller.toObject();
    
    res.json({
      bankDetails: sellerData.bankDetails || {},
      userInfo: {
        username: sellerData.username,
        shopName: sellerData.shopName,
        email: sellerData.email
      }
    });
  } catch (error) {
    console.error('Get bank details error:', error);
    res.status(500).json({ message: 'Server error fetching bank details' });
  }
});

// Update only bank details (optional - uses same updateProfile endpoint)
// router.put('/profile/:id/bank-details', checkAuth, async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     // Ensure the user can only update their own bank details
//     if (req.user.id !== id) {
//       return res.status(403).json({ message: 'Access denied' });
//     }

//     const { bankDetails } = req.body;
    
//     // Validate required bank details
//     if (bankDetails) {
//       const { accountHolder, bankName, ifsc, accountNumber } = bankDetails;
      
//       if (!accountHolder || !bankName || !ifsc || !accountNumber) {
//         return res.status(400).json({
//           message: 'Account holder name, bank name, IFSC code, and account number are required'
//         });
//       }

//       // Validate IFSC format
//       const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
//       if (!ifscRegex.test(ifsc.toUpperCase())) {
//         return res.status(400).json({
//           message: 'Invalid IFSC code format'
//         });
//       }

//       // Validate PAN format if provided
//       if (bankDetails.pan) {
//         const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
//         if (!panRegex.test(bankDetails.pan.toUpperCase())) {
//           return res.status(400).json({
//             message: 'Invalid PAN number format'
//           });
//         }
//       }

//       // Validate Aadhar format if provided
//       if (bankDetails.aadhar) {
//         const cleanAadhar = bankDetails.aadhar.replace(/\s/g, '');
//         if (cleanAadhar.length !== 12 || !/^\d{12}$/.test(cleanAadhar)) {
//           return res.status(400).json({
//             message: 'Invalid Aadhar number format'
//           });
//         }
//       }
//     }

//     // const Seller = require('../models/Seller');
//     const seller = await Seller.findById(id);
    
//     if (!seller) {
//       return res.status(404).json({ message: 'Seller not found' });
//     }

//     // Update bank details
//     seller.bankDetails = {
//       accountHolder: bankDetails.accountHolder?.trim(),
//       bankName: bankDetails.bankName?.trim(),
//       ifsc: bankDetails.ifsc?.trim().toUpperCase(),
//       accountNumber: bankDetails.accountNumber?.trim(),
//       pan: bankDetails.pan?.trim().toUpperCase(),
//       aadhar: bankDetails.aadhar?.trim()
//     };

//     // Update profile completion status
//     seller.updateProfileCompletionStatus();

//     await seller.save();

//     const updatedSellerData = seller.toObject();
//     delete updatedSellerData.password;
//     delete updatedSellerData.passwordResetToken;
//     delete updatedSellerData.passwordResetExpires;

//     res.json({
//       message: 'Bank details updated successfully',
//       bankDetails: updatedSellerData.bankDetails,
//       userInfo: {
//         username: updatedSellerData.username,
//         shopName: updatedSellerData.shopName,
//         email: updatedSellerData.email
//       }
//     });
//   } catch (error) {
//     console.error('Update bank details error:', error);
//     res.status(500).json({ message: 'Server error updating bank details' });
//   }
// });

// router.put('/profile/:id/bank-details', checkAuth, async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log('PUT /profile/:id/bank-details - Request:', { id, body: req.body });

//     if (req.user.id !== id) {
//       return res.status(403).json({ message: 'Access denied' });
//     }

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: 'Invalid seller ID' });
//     }

//     const { bankDetails } = req.body;

//     if (!bankDetails) {
//       return res.status(400).json({ message: 'Bank details are required' });
//     }

//     const { accountHolder, bankName, ifsc, accountNumber } = bankDetails;
//     if (!accountHolder || !bankName || !ifsc || !accountNumber) {
//       return res.status(400).json({
//         message: 'Account holder name, bank name, IFSC code, and account number are required',
//       });
//     }

//     const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
//     if (!ifscRegex.test(ifsc.toUpperCase())) {
//       return res.status(400).json({ message: 'Invalid IFSC code format' });
//     }

//     if (bankDetails.pan) {
//       const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
//       if (!panRegex.test(bankDetails.pan.toUpperCase())) {
//         return res.status(400).json({ message: 'Invalid PAN number format' });
//       }
//     }

//     if (bankDetails.aadhar) {
//       const cleanAadhar = bankDetails.aadhar.replace(/\s/g, '');
//       if (cleanAadhar.length !== 12 || !/^\d{12}$/.test(cleanAadhar)) {
//         return res.status(400).json({ message: 'Invalid Aadhar number format' });
//       }
//     }

//     if (mongoose.connection.readyState !== 1) {
//       return res.status(500).json({ message: 'Database connection error' });
//     }

//     const seller = await Seller.findById(id);
//     if (!seller) {
//       return res.status(404).json({ message: 'Seller not found' });
//     }

//     // Update bank details
//     seller.bankDetails = {
//       accountHolder: bankDetails.accountHolder?.trim() || '',
//       bankName: bankDetails.bankName?.trim() || '',
//       ifsc: bankDetails.ifsc?.trim().toUpperCase() || '',
//       accountNumber: bankDetails.accountNumber?.trim() || '',
//       pan: bankDetails.pan?.trim().toUpperCase() || '',
//       aadhar: bankDetails.aadhar?.trim().replace(/\s/g, '') || '',
//     };

//     // Log bank details for debugging
//     console.log('Updated bank details before saving:', seller.bankDetails);

//     // Update profile completion status
//     seller.profileComplete = !!(
//       seller.bankDetails.accountHolder &&
//       seller.bankDetails.bankName &&
//       seller.bankDetails.ifsc &&
//       seller.bankDetails.accountNumber
//     );

//     if (typeof seller.updateProfileCompletionStatus === 'function') {
//       seller.updateProfileCompletionStatus();
//     } else {
//       console.warn('updateProfileCompletionStatus is not defined on Seller model');
//     }

//     await seller.save();

//     // Prepare response
//     const updatedSellerData = seller.toObject();
//     delete updatedSellerData.password;
//     delete updatedSellerData.passwordResetToken;
//     delete updatedSellerData.passwordResetExpires;

//     res.json({
//       message: 'Bank details updated successfully',
//       bankDetails: updatedSellerData.bankDetails,
//       userInfo: {
//         username: updatedSellerData.username,
//         shopName: updatedSellerData.shopName,
//         email: updatedSellerData.email,
//       },
//     });
//   } catch (error) {
//     console.error('Update bank details error:', {
//       message: error.message,
//       stack: error.stack,
//       body: req.body,
//       id: req.params.id,
//     });
//     res.status(500).json({
//       message: 'Server error updating bank details',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined,
//     });
//   }
// });
router.put('/profile/:id/bank-details', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('PUT /profile/:id/bank-details - Request:', { id, body: req.body });

    if (req.user.id !== id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid seller ID' });
    }

    const { bankDetails } = req.body;

    if (!bankDetails) {
      return res.status(400).json({ message: 'Bank details are required' });
    }

    const { accountHolder, bankName, ifsc, accountNumber } = bankDetails;
    if (!accountHolder || !bankName || !ifsc || !accountNumber) {
      return res.status(400).json({
        message: 'Account holder name, bank name, IFSC code, and account number are required',
      });
    }

    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(ifsc.toUpperCase())) {
      return res.status(400).json({ message: 'Invalid IFSC code format' });
    }

    if (bankDetails.pan) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(bankDetails.pan.toUpperCase())) {
        return res.status(400).json({ message: 'Invalid PAN number format' });
      }
    }

    if (bankDetails.aadhar) {
      const cleanAadhar = bankDetails.aadhar.replace(/\s/g, '');
      if (cleanAadhar.length !== 12 || !/^\d{12}$/.test(cleanAadhar)) {
        return res.status(400).json({ message: 'Invalid Aadhar number format' });
      }
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ message: 'Database connection error' });
    }

    const seller = await Seller.findById(id);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    // Update bank details
    seller.bankDetails = {
      accountHolder: bankDetails.accountHolder?.trim() || '',
      bankName: bankDetails.bankName?.trim() || '',
      ifsc: bankDetails.ifsc?.trim().toUpperCase() || '',
      accountNumber: bankDetails.accountNumber?.trim() || '',
      pan: bankDetails.pan?.trim().toUpperCase() || '',
      aadhar: bankDetails.aadhar?.trim().replace(/\s/g, '') || '',
    };

    // Log bank details for debugging
    console.log('Updated bank details before saving:', seller.bankDetails);

    // Update profile completion status - FIXED: Only set boolean value
    seller.profileComplete = !!(
      seller.bankDetails.accountHolder &&
      seller.bankDetails.bankName &&
      seller.bankDetails.ifsc &&
      seller.bankDetails.accountNumber
    );

    // REMOVED: This was causing the error by overriding profileComplete with wrong value
    // if (typeof seller.updateProfileCompletionStatus === 'function') {
    //   seller.updateProfileCompletionStatus();
    // }

    await seller.save();

    // Prepare response
    const updatedSellerData = seller.toObject();
    delete updatedSellerData.password;
    delete updatedSellerData.passwordResetToken;
    delete updatedSellerData.passwordResetExpires;

    res.json({
      message: 'Bank details updated successfully',
      bankDetails: updatedSellerData.bankDetails,
      userInfo: {
        username: updatedSellerData.username,
        shopName: updatedSellerData.shopName,
        email: updatedSellerData.email,
      },
    });
  } catch (error) {
    console.error('Update bank details error:', {
      message: error.message,
      stack: error.stack,
      body: req.body,
      id: req.params.id,
    });
    res.status(500).json({
      message: 'Server error updating bank details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});
// Check if bank details are complete
router.get('/profile/:id/bank-details/status', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.user.id !== id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const Seller = require('../models/Seller');
    const seller = await Seller.findById(id);
    
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    const requiredFields = ['accountHolder', 'bankName', 'ifsc', 'accountNumber', 'pan', 'aadhar'];
    const completedFields = [];
    const missingFields = [];

    if (seller.bankDetails) {
      requiredFields.forEach(field => {
        if (seller.bankDetails[field] && seller.bankDetails[field].toString().trim()) {
          completedFields.push(field);
        } else {
          missingFields.push(field);
        }
      });
    } else {
      missingFields.push(...requiredFields);
    }

    const isComplete = missingFields.length === 0;
    
    res.json({
      isBankDetailsComplete: isComplete,
      requiredFields,
      completedFields,
      missingFields,
      completionPercentage: Math.round((completedFields.length / requiredFields.length) * 100)
    });
  } catch (error) {
    console.error('Check bank details status error:', error);
    res.status(500).json({ message: 'Server error checking bank details status' });
  }
});

// Auth check route
// router.get('/check-auth', checkAuth, (req, res) => {
//   res.json({ message: 'You are authenticated', user: req.user });
// });

// Auth check route
router.get('/check-auth', checkAuth, async (req, res) => {
  try {
    const seller = await Seller.findById(req.user.id).select('-password -passwordResetToken -passwordResetExpires');
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }
    console.log('Fetched seller document:', seller); // Debug log
    res.json({
      message: 'You are authenticated',
      seller: {
        id: seller._id,
        username: seller.username,
        email: seller.email,
        role: seller.role,
        shopName: seller.shopName,
        logo: seller.logo,
        theme: seller.theme || { id: null, name: null }, // Fallback to avoid empty theme
        bankDetails: seller.bankDetails,
        profileComplete: seller.profileComplete,
        createdAt: seller.createdAt,
        updatedAt: seller.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error in check-auth:', error);
    res.status(500).json({ message: 'Server error during authentication check' });
  }
});

module.exports = router;