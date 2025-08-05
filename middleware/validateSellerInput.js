const validateSellerInput = (req, res, next) => {
  const { username, email, password } = req.body;

  // Basic checks
  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Email format check (simple regex)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  // Password length check
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  next(); // All good, proceed to controller
};

module.exports = validateSellerInput;
