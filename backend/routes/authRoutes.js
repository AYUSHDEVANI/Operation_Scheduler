const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateProfile, requestOTP, verifyOTPAndChangePassword, forgotPassword, verifyResetOTP, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../middleware/validationSchemas');

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
// Public Forgot Password Routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);

// Protected Routes
router.post('/request-otp', protect, requestOTP);
router.post('/verify-otp', protect, verifyOTPAndChangePassword);

module.exports = router;
