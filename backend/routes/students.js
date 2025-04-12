const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const auth = require('../middleware/auth');

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

// Get all students for the logged-in admin
router.get('/', auth, async (req, res) => {
    try {
        const students = await Student.find({ adminId: req.admin._id });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get leaderboard data
router.get('/leaderboard', auth, async (req, res) => {
    try {
        const students = await Student.find({ adminId: req.admin._id })
            .sort({ 'marks.total': -1, attendancePercentage: -1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update student marks
router.patch('/:id/marks', auth, async (req, res) => {
    try {
        const student = await Student.findOne({
            _id: req.params.id,
            adminId: req.admin._id
        });

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        student.marks = { ...student.marks, ...req.body };
        await student.save();
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Record attendance
router.post('/attendance', auth, async (req, res) => {
    try {
        const { date, records } = req.body;

        for (const record of records) {
            const student = await Student.findOne({
                _id: record.studentId,
                adminId: req.admin._id
            });

            if (student) {
                // Remove existing attendance record for the same date if any
                student.attendance = student.attendance.filter(
                    a => a.date.toISOString().split('T')[0] !== date
                );

                // Add new attendance record
                student.attendance.push({
                    date: new Date(date),
                    present: record.present
                });

                await student.save();
            }
        }

        res.json({ message: 'Attendance recorded successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
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

// Get statistics for the logged-in admin
router.get('/stats', auth, async (req, res) => {
    try {
        const students = await Student.find({ adminId: req.admin._id });
        
        const stats = {
            totalStudents: students.length
        };

        console.log(`Statistics for admin ${req.admin.username}:`, stats);
        res.json(stats);
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 