// const mongoose = require("mongoose");
// const crypto = require('crypto');

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
//     enum: ['seller', 'buyer', 'admin'], // 👈 include all possible roles
//     default: 'seller',
//   },
//    passwordResetToken: String,
//   passwordResetExpires: Date
// }, { timestamps: true });


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

// // Hash password before saving
// sellerSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

// // Compare password method
// sellerSchema.methods.comparePassword = async function(candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
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

// // Hide password in JSON output
// sellerSchema.methods.toJSON = function() {
//   const seller = this.toObject();
//   delete seller.password;
//   delete seller.passwordResetToken;
//   return seller;
// };



// module.exports = mongoose.model("Seller", sellerSchema);


// const mongoose = require("mongoose");
// const crypto = require('crypto');
// const bcrypt = require("bcryptjs"); // ✅ added

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
//     enum: ['seller', 'buyer', 'admin'],
//     default: 'seller',
//   },
//   passwordResetToken: String,
//   passwordResetExpires: Date
// }, { timestamps: true });

// // Hash password before saving
// sellerSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

// // Compare password method
// sellerSchema.methods.comparePassword = async function(candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
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
    minlength: 8 // ✅ Consistent with frontend validation
  },
  role: {
    type: String,
    enum: ['seller', 'buyer', 'admin', 'tailor'], // ✅ Added 'tailor'
    default: 'seller',
  },
  passwordResetToken: String,
  passwordResetExpires: Date
}, { timestamps: true });

// Hash password before saving
sellerSchema.pre('save', async function(next) {
  try {
    // Only hash if password is modified (new or changed)
    if (!this.isModified('password')) return next();
    
    console.log('Hashing password in schema pre-save hook'); // Debug log
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    console.error('Error in password hashing:', error); // Debug log
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

// Hide sensitive fields in JSON
sellerSchema.methods.toJSON = function() {
  const seller = this.toObject();
  delete seller.password;
  delete seller.passwordResetToken;
  delete seller.passwordResetExpires;
  return seller;
};

module.exports = mongoose.model("Seller", sellerSchema);