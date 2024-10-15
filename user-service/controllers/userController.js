const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const bcrypt = require('bcryptjs');

// Register new user
exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const user = await User.create({ name, email, password });

        // Generate JWT token
        const token = generateToken(user._id);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Login user
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            const token = generateToken(user._id);
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token
            });
        } else {
            res.status(400).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get user details (requires token)
exports.getUserDetails = async (req, res) => {
    const user = await User.findById(req.user.id).select('-password'); // Exclude password

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
};

// Change password
exports.changePassword = async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user && (await user.matchPassword(req.body.currentPassword))) {
        user.password = req.body.newPassword;
        await user.save();
        res.status(200).json({ message: 'Password changed successfully' });
    } else {
        res.status(400).json({ message: 'Current password is incorrect' });
    }
};

// Reset password logic should involve sending a reset token (not implemented here for brevity)
