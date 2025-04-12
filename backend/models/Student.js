const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    rollNumber: { 
        type: String, 
        required: true, 
        unique: true 
    },
    adminId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Admin', 
        required: true 
    },
    progress: { 
        type: String, 
        enum: ['Not Started', 'In Progress', 'Completed'],
        default: 'Not Started' 
    },
    marks: {
        presentation: {
            type: Number,
            default: 0
        },
        efforts: {
            type: Number,
            default: 0
        },
        assignment: {
            type: Number,
            default: 0
        },
        assessment: {
            type: Number,
            default: 0
        },
        total: {
            type: Number,
            default: 0
        }
    },
    attendance: [{
        date: {
            type: Date,
            required: true
        },
        present: {
            type: Boolean,
            default: false
        }
    }],
    attendancePercentage: {
        type: Number,
        default: 0
    },
    lastUpdated: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });

// Calculate total marks before saving
studentSchema.pre('save', function(next) {
    this.marks.total = this.marks.presentation + this.marks.efforts + 
                      this.marks.assignment + this.marks.assessment;
    next();
});

// Calculate attendance percentage before saving
studentSchema.pre('save', function(next) {
    if (this.attendance.length > 0) {
        const presentDays = this.attendance.filter(record => record.present).length;
        this.attendancePercentage = (presentDays / this.attendance.length) * 100;
    }
    next();
});

// Only create the model if it doesn't exist
let Student;
try {
    Student = mongoose.model('Student');
} catch (error) {
    Student = mongoose.model('Student', studentSchema);
}

module.exports = Student; 