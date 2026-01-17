const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../logs/logger');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      logger.info(`User logged in: ${user.email}`);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // Force role to USER for public registration
  // Super Admins can promote users later
  const role = 'USER'; 

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'USER', // Default to USER, allows explicit ADMIN creation if needed (should be restricted in prod)
    });

    if (user) {
      logger.info(`New user registered: ${user.email}`);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    logger.error(`Register error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    logger.error(`Get Me Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { sendOTP } = require('../services/emailService');

// ... (existing exports)

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    // user.email = req.body.email || user.email; // Email update usually requires re-verification

    const updatedUser = await user.save();
    
    logger.info(`User profile updated: ${updatedUser.email}`);

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Request Password Reset OTP
// @route   POST /api/auth/request-otp
// @access  Private (Logged in user changing password)
const requestOTP = async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 Minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    await sendOTP(user.email, otp);
    logger.info(`OTP sent to ${user.email}`);

    res.json({ message: 'OTP sent to your email' });
};

// @desc    Verify OTP and Change Password
// @route   POST /api/auth/verify-otp
// @access  Private
const verifyOTPAndChangePassword = async (req, res) => {
    const { otp, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    if (user.otp === otp && user.otpExpires > Date.now()) {
        user.password = newPassword; // Will be hashed by pre-save hook
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        logger.info(`Password changed for user ${user.email}`);
        res.json({ message: 'Password changed successfully' });
    } else {
        res.status(400).json({ message: 'Invalid or expired OTP' });
    }
};

// @desc    Forgot Password - Request OTP (Public)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 Minutes

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        await sendOTP(user.email, otp);
        logger.info(`Forgot Password OTP sent to ${user.email}`);

        res.json({ message: 'OTP sent to your email' });
    } catch (error) {
        logger.error(`Forgot Password Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Verify OTP for Password Reset (Public)
// @route   POST /api/auth/verify-reset-otp
// @access  Public
const verifyResetOTP = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.otp === otp && user.otpExpires > Date.now()) {
            res.json({ message: 'OTP Verified' });
        } else {
            res.status(400).json({ message: 'Invalid or expired OTP' });
        }
    } catch (error) {
        logger.error(`Verify OTP Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Reset Password with OTP (Public)
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.otp === otp && user.otpExpires > Date.now()) {
            user.password = newPassword; // Will be hashed by pre-save hook
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();

            logger.info(`Password successfully reset for ${user.email}`);
            res.json({ message: 'Password reset successfully' });
        } else {
            res.status(400).json({ message: 'Invalid or expired OTP' });
        }
    } catch (error) {
        logger.error(`Reset Password Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { 
    loginUser, 
    registerUser, 
    getMe, 
    updateProfile, 
    requestOTP, 
    verifyOTPAndChangePassword,
    forgotPassword,
    verifyResetOTP,
    resetPassword
};
