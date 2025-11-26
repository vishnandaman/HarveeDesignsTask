const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticate, isAdmin } = require('../middleware/auth');
const upload = require('../utils/upload');
const fs = require('fs');
const path = require('path');

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { search, state, city, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (state) {
      query.state = { $regex: state, $options: 'i' };
    }

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get users with pagination
    const users = await User.find(query)
      .select('-password -refreshToken')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalUsers: total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Users can only view their own profile unless they're admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private
router.put('/:id',
  authenticate,
  upload.single('profile_image'),
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 3 })
      .withMessage('Name must be at least 3 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Name must contain only alphabets'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail(),
    body('phone')
      .optional()
      .matches(/^\d{10,15}$/)
      .withMessage('Phone must be 10-15 digits'),
    body('pincode')
      .optional()
      .matches(/^\d{4,10}$/)
      .withMessage('Pincode must be 4-10 digits'),
    body('address')
      .optional()
      .isLength({ max: 150 })
      .withMessage('Address must not exceed 150 characters')
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

      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Users can only update their own profile unless they're admin
      if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Check if email/phone already exists (excluding current user)
      const { email, phone } = req.body;
      if (email || phone) {
        const existingUser = await User.findOne({
          _id: { $ne: req.params.id },
          $or: [
            ...(email ? [{ email }] : []),
            ...(phone ? [{ phone }] : [])
          ]
        });

        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Email or phone already exists'
          });
        }
      }

      // Handle profile image update
      if (req.file) {
        // Delete old image if exists
        if (user.profile_image) {
          const oldImagePath = path.join(__dirname, '..', user.profile_image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        user.profile_image = `/uploads/${req.file.filename}`;
      }

      // Update user fields
      const allowedUpdates = ['name', 'email', 'phone', 'address', 'state', 'city', 'country', 'pincode'];
      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          user[field] = req.body[field];
        }
      });

      // Admin can update role
      if (req.user.role === 'admin' && req.body.role) {
        user.role = req.body.role;
      }

      await user.save();

      const userResponse = user.toObject();
      delete userResponse.password;
      delete userResponse.refreshToken;

      res.json({
        success: true,
        message: 'User updated successfully',
        data: { user: userResponse }
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Delete profile image if exists
    if (user.profile_image) {
      const imagePath = path.join(__dirname, '..', user.profile_image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;

