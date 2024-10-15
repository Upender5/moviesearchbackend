const express = require('express');
const { register, login, getUserDetails, changePassword } = require('../controllers/userController');
const { authMiddleware } = require('../../middleware/authMiddleware'); 
const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Private routes (require auth)
router.get('/profile', authMiddleware, getUserDetails);
router.post('/change-password', authMiddleware, changePassword);

module.exports = router;
