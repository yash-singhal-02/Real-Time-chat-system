const express = require('express');
const { registerUser, loginUser, requestOtp, verifyOtp, resetPassword } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

module.exports = router;
