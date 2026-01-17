const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateProfile, requestOTP, verifyOTPAndChangePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../middleware/validationSchemas');

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/request-otp', protect, requestOTP);
router.post('/verify-otp', protect, verifyOTPAndChangePassword);

module.exports = router;
