const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const { Login } = require('../models/Login');

// Enhanced login validation
const validateLoginInput = (userName, password) => {
  const errors = {};

  // Username validation
  if (validator.isEmpty(userName)) {
    errors.userName = 'Username is required';
  }

  // Password validation
  if (validator.isEmpty(password)) {
    errors.password = 'Password is required';
  } else if (!validator.isLength(password, { min: 6 })) {
    errors.password = 'Password must be at least 6 characters';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

// Login controller with enhanced validation
const loginUser = async (req, res) => {
  try {
    const { f_userName, f_Pwd } = req.body;

    // Validate input
    const { errors, isValid } = validateLoginInput(f_userName, f_Pwd);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    // Find user
    const user = await Login.findOne({ f_userName });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(f_Pwd, user.f_Pwd);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token with additional info
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.f_userName,
        loginTime: Date.now()
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    res.json({ 
      token, 
      user: { 
        id: user._id, 
        username: user.f_userName 
      } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// User registration with enhanced validation
const registerUser = async (req, res) => {
  try {
    const { f_userName, f_Pwd, f_Email } = req.body;

    // Validate email
    if (!validator.isEmail(f_Email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check for existing user
    const existingUser = await Login.findOne({ 
      $or: [
        { f_userName },
        { f_Email }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'Username or email already exists' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(f_Pwd, salt);

    // Create new user
    const newUser = new Login({
      f_userName,
      f_Pwd: hashedPassword,
      f_Email
    });

    await newUser.save();

    res.status(201).json({ 
      message: 'User registered successfully',
      user: { 
        id: newUser._id, 
        username: newUser.f_userName 
      } 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Registration failed', 
      error: error.message 
    });
  }
};

module.exports = {
  loginUser,
  registerUser
};