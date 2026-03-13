import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import { protect } from '../middleware/authMiddleware.js';

// ---> ADD THESE 3 LINES <---
import Student from '../models/studentModel.js';
import Event from '../models/eventModel.js';
import House from '../models/houseModel.js';
const router = express.Router();

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user (admin)
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please add all fields' });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({
    name,
    email,
    password, // Password will be hashed by the 'pre-save' hook in the model
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
});

// @desc    Authenticate a user (login)
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      profilePictureUrl: user.profilePictureUrl,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  // req.user is attached by the 'protect' middleware
  res.json(req.user);
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.profilePictureUrl = req.body.profilePictureUrl ?? user.profilePictureUrl;
    
    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      profilePictureUrl: updatedUser.profilePictureUrl,
      token: generateToken(updatedUser._id), // Re-issue token in case info changed
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// @desc    Change user password
// @route   POST /api/auth/changepassword
// @access  Private
router.post('/changepassword', protect, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Please provide all fields' });
    }

    const user = await User.findById(req.user.id);

    if (user && (await user.matchPassword(currentPassword))) {
        user.password = newPassword; // Hook will re-hash
        await user.save();
        res.json({ message: 'Password updated successfully' });
    } else {
        res.status(401).json({ message: 'Invalid current password' });
    }
});

// @desc    Delete user account and ALL associated data
// @route   DELETE /api/auth/profile
// @access  Private
router.delete('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 1. Delete all Students created by this admin
        await Student.deleteMany({ user: user._id });

        // 2. Delete all Events created by this admin
        await Event.deleteMany({ user: user._id });

        // 3. Delete all House configurations created by this admin
        await House.deleteMany({ user: user._id });

        // 4. Finally, delete the admin user account itself
        await User.deleteOne({ _id: user._id });

        res.json({ message: 'Account and all associated data permanently deleted from database.' });
    } catch (error) {
        console.error('Error during complete account deletion:', error);
        res.status(500).json({ message: 'Server error during account deletion process.' });
    }
});

export default router;