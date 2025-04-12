const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Only create the model if it doesn't exist
let Admin;
try {
    Admin = mongoose.model('Admin');
} catch (error) {
    Admin = mongoose.model('Admin', adminSchema);
}

module.exports = Admin; 