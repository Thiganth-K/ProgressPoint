const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.adminId = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Get students for an admin
router.get('/', verifyToken, async (req, res) => {
    try {
        const students = await Student.find({ adminId: req.adminId });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add a new student
router.post('/', verifyToken, async (req, res) => {
    try {
        const { name, rollNumber } = req.body;
        
        const student = new Student({
            name,
            rollNumber,
            adminId: req.adminId
        });
        
        await student.save();
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update student progress
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { progress } = req.body;
        
        const student = await Student.findOneAndUpdate(
            { _id: req.params.id, adminId: req.adminId },
            { progress, lastUpdated: Date.now() },
            { new: true }
        );

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json(student);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 