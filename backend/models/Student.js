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
        default: 'Not Started' 
    },
    lastUpdated: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });

// Only create the model if it doesn't exist
let Student;
try {
    Student = mongoose.model('Student');
} catch (error) {
    Student = mongoose.model('Student', studentSchema);
}

module.exports = Student; 