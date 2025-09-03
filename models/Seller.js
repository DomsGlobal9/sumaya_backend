// const mongoose = require("mongoose");
// const crypto = require('crypto');
// const bcrypt = require("bcryptjs");

// const sellerSchema = new mongoose.Schema({
//   username: {
//     type: String,
//     required: true,
//     minlength: 3,
//     maxlength: 30,
//     match: /^[a-zA-Z0-9_]+$/
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true,
//     match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//   },
//   password: {
//     type: String,
//     required: true,
//     minlength: 8 // ✅ Consistent with frontend validation
//   },
//   role: {
//     type: String,
//     enum: ['seller', 'buyer', 'admin', 'tailor'], // ✅ Added 'tailor'
//     default: 'seller',
//   },
//   passwordResetToken: String,
//   passwordResetExpires: Date
// }, { timestamps: true });

// // Hash password before saving
// sellerSchema.pre('save', async function(next) {
//   try {
//     // Only hash if password is modified (new or changed)
//     if (!this.isModified('password')) return next();
    
//     console.log('Hashing password in schema pre-save hook'); // Debug log
//     this.password = await bcrypt.hash(this.password, 12);
//     next();
//   } catch (error) {
//     console.error('Error in password hashing:', error); // Debug log
//     next(error);
//   }
// });

// // Compare password method
// sellerSchema.methods.comparePassword = async function(candidatePassword) {
//   try {
//     return await bcrypt.compare(candidatePassword, this.password);
//   } catch (error) {
//     console.error('Error comparing passwords:', error);
//     return false;
//   }
// };

// // Method to generate reset token
// sellerSchema.methods.createPasswordResetToken = function() {
//   const resetToken = crypto.randomBytes(32).toString('hex');
//   this.passwordResetToken = crypto
//     .createHash('sha256')
//     .update(resetToken)
//     .digest('hex');
//   this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
//   return resetToken;
// };

// // Hide sensitive fields in JSON
// sellerSchema.methods.toJSON = function() {
//   const seller = this.toObject();
//   delete seller.password;
//   delete seller.passwordResetToken;
//   delete seller.passwordResetExpires;
//   return seller;
// };

// module.exports = mongoose.model("Seller", sellerSchema);

// const mongoose = require("mongoose");
// const crypto = require('crypto');
// const bcrypt = require("bcryptjs");

// const sellerSchema = new mongoose.Schema({
//   username: {
//     type: String,
//     required: true,
//     minlength: 3,
//     maxlength: 30,
//     match: /^[a-zA-Z0-9_]+$/
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true,
//     match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//   },
//   password: {
//     type: String,
//     required: true,
//     minlength: 8
//   },
//   role: {
//     type: String,
//     enum: ['seller', 'buyer', 'admin', 'tailor'],
//     default: 'seller',
//   },
  
//   // Shop/Brand Information
//   shopName: {
//     type: String,
//     trim: true
//   },
  
//   // Logo Information
//   logo: {
//     type: {
//       type: String,
//       enum: ['uploaded', 'generated'],
//       default: 'generated'
//     },
//     url: {
//       type: String, // Store logo URL/path
//       trim: true
//     },
//     style: {
//       type: String,
//       enum: ['Classic', 'Modern & Minimal', 'Professional', 'Feminine & Elegant', 'Bold & Strong'],
//       trim: true
//     }
//   },
  
//   // Theme Information
//   theme: {
//     id: {
//       type: Number,
//       enum: [1, 2, 3, 4] // Based on your theme IDs
//     },
//     name: {
//       type: String,
//       enum: ['Light Theme', 'Dark Theme', 'Vibrant Theme', 'Earthy Theme']
//     }
//   },
  
//   // Bank Details
//   bankDetails: {
//     accountHolder: {
//       type: String,
//       trim: true
//     },
//     bankName: {
//       type: String,
//       trim: true
//     },
//     ifsc: {
//       type: String,
//       trim: true,
//       uppercase: true
//     },
//     accountNumber: {
//       type: String,
//       trim: true
//     },
//     pan: {
//       type: String,
//       trim: true,
//       uppercase: true
//     },
//     aadhar: {
//       type: String,
//       trim: true
//     }
//   },
  
//   // Profile completion status
//   profileComplete: {
//     type: Boolean,
//     default: false
//   },
  
//   passwordResetToken: String,
//   passwordResetExpires: Date
// }, { timestamps: true });

// // Hash password before saving
// sellerSchema.pre('save', async function(next) {
//   try {
//     // Only hash if password is modified (new or changed)
//     if (!this.isModified('password')) return next();
    
//     console.log('Hashing password in schema pre-save hook');
//     this.password = await bcrypt.hash(this.password, 12);
//     next();
//   } catch (error) {
//     console.error('Error in password hashing:', error);
//     next(error);
//   }
// });

// // Compare password method
// sellerSchema.methods.comparePassword = async function(candidatePassword) {
//   try {
//     return await bcrypt.compare(candidatePassword, this.password);
//   } catch (error) {
//     console.error('Error comparing passwords:', error);
//     return false;
//   }
// };

// // Method to generate reset token
// sellerSchema.methods.createPasswordResetToken = function() {
//   const resetToken = crypto.randomBytes(32).toString('hex');
//   this.passwordResetToken = crypto
//     .createHash('sha256')
//     .update(resetToken)
//     .digest('hex');
//   this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
//   return resetToken;
// };

// // Method to update profile completion status
// sellerSchema.methods.updateProfileCompletionStatus = function() {
//   const hasLogo = this.logo && this.logo.url;
//   const hasTheme = this.theme && this.theme.id;
//   const hasBankDetails = this.bankDetails && 
//     this.bankDetails.accountHolder && 
//     this.bankDetails.bankName && 
//     this.bankDetails.ifsc && 
//     this.bankDetails.accountNumber && 
//     this.bankDetails.pan && 
//     this.bankDetails.aadhar;
  
//   this.profileComplete = hasLogo && hasTheme && hasBankDetails;
//   return this.profileComplete;
// };

// // Hide sensitive fields in JSON
// sellerSchema.methods.toJSON = function() {
//   const seller = this.toObject();
//   delete seller.password;
//   delete seller.passwordResetToken;
//   delete seller.passwordResetExpires;
//   // Optionally hide sensitive bank details in certain contexts
//   if (seller.bankDetails) {
//     seller.bankDetails = {
//       ...seller.bankDetails,
//       accountNumber: seller.bankDetails.accountNumber ? '****' + seller.bankDetails.accountNumber.slice(-4) : undefined,
//       pan: seller.bankDetails.pan ? seller.bankDetails.pan.slice(0, 3) + '****' + seller.bankDetails.pan.slice(-1) : undefined,
//       aadhar: seller.bankDetails.aadhar ? '****' + seller.bankDetails.aadhar.slice(-4) : undefined
//     };
//   }
//   return seller;
// };

// module.exports = mongoose.model("Seller", sellerSchema);


const mongoose = require("mongoose");
const crypto = require('crypto');
const bcrypt = require("bcryptjs");

const sellerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_]+$/
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: {
    type: String,
    enum: ['seller', 'buyer', 'admin', 'tailor'],
    default: 'seller',
  },
  
  // Shop/Brand Information
  shopName: {
    type: String,
    trim: true
  },
  
  // Logo Information
  logo: {
    type: {
      type: String,
      enum: ['uploaded', 'generated'],
      default: 'generated'
    },
    url: {
      type: String, // Store logo URL/path
      trim: true
    },
    style: {
      type: String,
      enum: ['Classic', 'Modern & Minimal', 'Professional', 'Feminine & Elegant', 'Bold & Strong'],
      trim: true
    }
  },
  
  // Theme Information
  theme: {
    id: {
      type: Number,
      enum: [1, 2, 3, 4] // Based on your theme IDs
    },
    name: {
      type: String,
      enum: ['Light Theme', 'Dark Theme', 'Vibrant Theme', 'Earthy Theme']
    }
  },
  
  // Bank Details
  bankDetails: {
    accountHolder: {
      type: String,
      trim: true
    },
    bankName: {
      type: String,
      trim: true
    },
    ifsc: {
      type: String,
      trim: true,
      uppercase: true
    },
    accountNumber: {
      type: String,
      trim: true
    },
    pan: {
      type: String,
      trim: true,
      uppercase: true
    },
    aadhar: {
      type: String,
      trim: true
    }
  },
  
  // Profile completion status
  profileComplete: {
    type: Boolean, 
    default: false
  },
  
  passwordResetToken: String,
  passwordResetExpires: Date
}, { timestamps: true });

// Hash password before saving
sellerSchema.pre('save', async function(next) {
  try {
    // Only hash if password is modified (new or changed)
    if (!this.isModified('password')) return next();
    
    console.log('Hashing password in schema pre-save hook');
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    console.error('Error in password hashing:', error);
    next(error);
  }
});

// Compare password method
sellerSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

// Method to generate reset token
sellerSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

// Method to update profile completion status
sellerSchema.methods.updateProfileCompletionStatus = function() {
  const hasLogo = this.logo && this.logo.url;
  const hasTheme = this.theme && this.theme.id;
  const hasBankDetails = this.bankDetails && 
    this.bankDetails.accountHolder && 
    this.bankDetails.bankName && 
    this.bankDetails.ifsc && 
    this.bankDetails.accountNumber && 
    this.bankDetails.pan && 
    this.bankDetails.aadhar;
  
  this.profileComplete = hasLogo && hasTheme && hasBankDetails;
  return this.profileComplete;
};

// Method to check if bank details are complete
sellerSchema.methods.isBankDetailsComplete = function() {
  const { accountHolder, bankName, ifsc, accountNumber } = this.bankDetails || {};
  return !!(accountHolder && bankName && ifsc && accountNumber);
};

// Method to check which bank details are missing
sellerSchema.methods.getMissingBankDetails = function() {
  const requiredFields = ['accountHolder', 'bankName', 'ifsc', 'accountNumber'];
  const missingFields = [];
  
  if (!this.bankDetails) {
    return requiredFields;
  }
  
  requiredFields.forEach(field => {
    if (!this.bankDetails[field] || !this.bankDetails[field].toString().trim()) {
      missingFields.push(field);
    }
  });
  
  return missingFields;
};

// Method to get public profile (with masked sensitive data)
sellerSchema.methods.getPublicProfile = function() {
  const seller = this.toObject();
  delete seller.password;
  delete seller.passwordResetToken;
  delete seller.passwordResetExpires;
  
  // Mask sensitive bank details for public view
  if (seller.bankDetails) {
    seller.bankDetails = {
      ...seller.bankDetails,
      accountNumber: seller.bankDetails.accountNumber ? '****' + seller.bankDetails.accountNumber.slice(-4) : undefined,
      pan: seller.bankDetails.pan ? seller.bankDetails.pan.slice(0, 3) + '****' + seller.bankDetails.pan.slice(-1) : undefined,
      aadhar: seller.bankDetails.aadhar ? '****' + seller.bankDetails.aadhar.slice(-4) : undefined
    };
  }
  return seller;
};

// Method to get private profile (unmasked for owner)
sellerSchema.methods.getPrivateProfile = function() {
  const seller = this.toObject();
  delete seller.password;
  delete seller.passwordResetToken;
  delete seller.passwordResetExpires;
  return seller;
};

// Virtual for full display name
sellerSchema.virtual('displayName').get(function() {
  return this.shopName || this.username;
});

// Hide sensitive fields in JSON (default behavior when sending responses)
sellerSchema.methods.toJSON = function() {
  const seller = this.toObject();
  delete seller.password;
  delete seller.passwordResetToken;
  delete seller.passwordResetExpires;
  
  // Mask sensitive bank details in default JSON response
  if (seller.bankDetails) {
    seller.bankDetails = {
      ...seller.bankDetails,
      accountNumber: seller.bankDetails.accountNumber ? '****' + seller.bankDetails.accountNumber.slice(-4) : undefined,
      pan: seller.bankDetails.pan ? seller.bankDetails.pan.slice(0, 3) + '****' + seller.bankDetails.pan.slice(-1) : undefined,
      aadhar: seller.bankDetails.aadhar ? '****' + seller.bankDetails.aadhar.slice(-4) : undefined
    };
  }
  return seller;
};

// Index for better performance
sellerSchema.index({ email: 1 });
sellerSchema.index({ username: 1 });
sellerSchema.index({ 'bankDetails.pan': 1 });
sellerSchema.index({ profileComplete: 1 });

// Static methods
sellerSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

sellerSchema.statics.findCompleteProfiles = function() {
  return this.find({ profileComplete: true });
};

sellerSchema.statics.findIncompleteProfiles = function() {
  return this.find({ profileComplete: false });
};

module.exports = mongoose.model("Seller", sellerSchema);