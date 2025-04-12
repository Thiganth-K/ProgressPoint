const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Login attempt:', { username });

        const admin = await Admin.findOne({ username });
        if (!admin) {
            console.log('Admin not found:', { username });
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            console.log('Password mismatch for:', { username });
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: admin._id, username: admin.username },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1h' }
        );

        console.log('Login successful:', { username });
        res.json({ token, adminId: admin._id });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Setup initial admin accounts
router.post('/setup', async (req, res) => {
    try {
        const admins = [
            { username: 'Dhanush', password: '1234abcd' },
            { username: 'Mei na', password: '5678efgh' }
        ];

        for (const admin of admins) {
            const existingAdmin = await Admin.findOne({ username: admin.username });
            if (!existingAdmin) {
                const hashedPassword = await bcrypt.hash(admin.password, 10);
                const newAdmin = new Admin({
                    username: admin.username,
                    password: hashedPassword
                });
                await newAdmin.save();
                console.log('Created admin:', admin.username);
            } else {
                console.log('Admin already exists:', admin.username);
            }
        }

        res.json({ message: 'Admin accounts setup completed' });
    } catch (error) {
        console.error('Setup error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 