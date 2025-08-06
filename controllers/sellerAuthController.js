const Seller = require("../models/Seller");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require('../utils/email');
const crypto = require('crypto');


exports.registerSeller = async (req, res) => {
  const { username, email, password, confirmPassword, role } = req.body;

  try {
    // Input validation
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ 
        message: "All fields are required" 
      });
    }

    // Validate password match
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        message: "Passwords do not match" 
      });
    }

    // Additional validations
    if (username.length < 3) {
      return res.status(400).json({ 
        message: "Username must be at least 3 characters long" 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters long" 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: "Please provide a valid email address" 
      });
    }

    // Check if email exists
    const existingUser = await Seller.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        message: "Email already in use" 
      });
    }

    // Check if username exists
    const existingUsername = await Seller.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ 
        message: "Username already taken" 
      });
    }

    // Hash password
    const saltRounds = 12; // Increased for better security
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create seller
    const newSeller = new Seller({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role || "seller",
    });

    await newSeller.save();

    // Return success response with proper JSON
    return res.status(201).json({ 
      message: "Account created successfully",
      user: {
        id: newSeller._id,
        username: newSeller.username,
        email: newSeller.email,
        role: newSeller.role
      }
    });
    
  } catch (error) {
    console.error("Signup error:", error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field} already exists` 
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: messages.join(', ') 
      });
    }

    // Generic server error
    res.status(500).json({ 
      message: "Server error occurred while creating account",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.loginSeller = async (req, res) => {
  console.log(req.body)
  const { email, password, role } = req.body;

  try {
    // Input validation - only email and password are required for login
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email and password are required" 
      });
    }

    // Trim whitespace
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      return res.status(400).json({ 
        message: "Email and password cannot be empty" 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ 
        message: "Please provide a valid email address" 
      });
    }

    // Find user by email (case insensitive)
    const seller = await Seller.findOne({ 
      email: trimmedEmail.toLowerCase() 
    });

    if (!seller) {
      return res.status(400).json({ 
        message: "Invalid credentials" 
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(trimmedPassword, seller.password);
    if (!isMatch) {
      return res.status(400).json({ 
        message: "Invalid credentials" 
      });
    }

    // Optional: Verify role matches if role is provided
    if (role && seller.role !== role) {
      return res.status(400).json({ 
        message: `This account is not registered as a ${role}` 
      });
    }

    // Check if JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ 
        message: "Server configuration error" 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: seller._id, 
        email: seller.email,
        role: seller.role 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" }
    );

    // Return success response
    res.status(200).json({ 
      message: "Login successful",
      token, 
      seller: { 
        id: seller._id, 
        email: seller.email, 
        username: seller.username,
        role: seller.role
      } 
    });

  } catch (error) {
    console.error("Login error:", error);
    
    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(500).json({ 
        message: "Token generation failed" 
      });

    }
    
    // Handle database errors
    if (error.name === 'MongoError' || error.name === 'MongooseError') {
      return res.status(500).json({ 
        message: "Database error occurred" 
      });
    }

    // Generic server error
    res.status(500).json({ 
      message: "Server error occurred during login",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Validate email
    if (!email) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide an email address'
      });
    }

    // 2. Check if user exists
    const seller = await Seller.findOne({ email });
    if (!seller) {
      return res.status(404).json({
        status: 'fail',
        message: 'No account found with that email address'
      });
    }

    // 3. Generate reset token
    const resetToken = seller.createPasswordResetToken();
    await seller.save({ validateBeforeSave: false });

    // 4. Send email with reset URL
      const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    // const resetURL = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    
    try {
      await sendEmail({
        email: seller.email,
        subject: 'Your password reset token (valid for 10 min)',
        message: `Forgot your password? Click this link to reset it: ${resetURL}\nIf you didn't request this, please ignore this email.`
      });

      res.status(200).json({
        status: 'success',
        message: 'email  sent to successfull..!'
      });
    } catch (err) {
      // Reset the token if email fails
      seller.passwordResetToken = undefined;
      seller.passwordResetExpires = undefined;
      await seller.save({ validateBeforeSave: false });

      return res.status(500).json({
        status: 'error',
        message: 'There was an error sending the email. Try again later!'
      });
    }
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params; // token from URL
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ status: 'fail', message: 'Missing token or password' });
    }

    // 1. Hash the token to match the stored one
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // 2. Find seller by hashed token and check if not expired
    const seller = await Seller.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!seller) {
      return res.status(400).json({ status: 'fail', message: 'Token is invalid or has expired' });
    }

    // 3. Update password
    const salt = await bcrypt.genSalt(10);
    seller.password = await bcrypt.hash(password, salt);

    // 4. Clear reset token fields
    seller.passwordResetToken = undefined;
    seller.passwordResetExpires = undefined;

    await seller.save();

    res.status(200).json({ status: 'success', message: 'Password reset successful!' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
