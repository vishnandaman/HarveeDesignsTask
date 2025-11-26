const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const upload = require('../utils/upload');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', 
  upload.single('profile_image'),
  [
    body('name')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Name must be at least 3 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Name must contain only alphabets'),
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail(),
    body('phone')
      .matches(/^\d{10,15}$/)
      .withMessage('Phone must be 10-15 digits'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
      .matches(/\d/)
      .withMessage('Password must contain at least one number'),
    body('state')
      .notEmpty()
      .withMessage('State is required'),
    body('city')
      .notEmpty()
      .withMessage('City is required'),
    body('country')
      .notEmpty()
      .withMessage('Country is required'),
    body('pincode')
      .matches(/^\d{4,10}$/)
      .withMessage('Pincode must be 4-10 digits'),
    body('address')
      .optional()
      .isLength({ max: 150 })
      .withMessage('Address must not exceed 150 characters')
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { name, email, phone, password, address, state, city, country, pincode } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [{ email }, { phone }] 
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email or phone already exists'
        });
      }

      // Handle profile image
      let profileImagePath = null;
      if (req.file) {
        profileImagePath = `/uploads/${req.file.filename}`;
      }

      // Create new user
      const user = new User({
        name,
        email,
        phone,
        password,
        address: address || '',
        state,
        city,
        country,
        pincode,
        profile_image: profileImagePath
      });

      await user.save();

      // Generate tokens
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Save refresh token to database
      user.refreshToken = refreshToken;
      await user.save();

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;
      delete userResponse.refreshToken;

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: userResponse,
          tokens: {
            accessToken,
            refreshToken
          }
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during registration',
        error: error.message
      });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login',
  [
    body('emailOrPhone')
      .notEmpty()
      .withMessage('Email or phone is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { emailOrPhone, password } = req.body;

      // Find user by email or phone
      const user = await User.findOne({
        $or: [
          { email: emailOrPhone.toLowerCase() },
          { phone: emailOrPhone }
        ]
      }).select('+password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate tokens
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Save refresh token
      user.refreshToken = refreshToken;
      await user.save();

      // Remove sensitive data from response
      const userResponse = user.toObject();
      delete userResponse.password;
      delete userResponse.refreshToken;

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: userResponse,
          tokens: {
            accessToken,
            refreshToken
          }
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during login',
        error: error.message
      });
    }
  }
);

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const accessToken = generateAccessToken(user._id);
    res.json({
      success: true,
      data: {
        accessToken
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token'
    });
  }
});

module.exports = router;

