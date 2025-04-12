const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/progresspoint', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Admin Schema
const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Student Schema
const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rollNumber: { type: String, required: true, unique: true },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    progress: { type: String, default: 'Not Started' },
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

// Check if models exist before creating them
const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);

// Seed data
const seedData = async () => {
    try {
        // Clear existing data
        await Admin.deleteMany({});
        await Student.deleteMany({});

        // Create admin accounts
        const admin1 = new Admin({
            username: 'Dhanush',
            password: await bcrypt.hash('1234abcd', 10)
        });

        const admin2 = new Admin({
            username: 'Mei na',
            password: await bcrypt.hash('5678efgh', 10)
        });

        const savedAdmin1 = await admin1.save();
        const savedAdmin2 = await admin2.save();

        console.log('Admin accounts created:', {
            admin1: savedAdmin1.username,
            admin2: savedAdmin2.username
        });

        // Create students for admin1
        const admin1Students = [
            { name: 'John Doe', rollNumber: 'A001', adminId: savedAdmin1._id },
            { name: 'Jane Smith', rollNumber: 'A002', adminId: savedAdmin1._id },
            { name: 'Mike Johnson', rollNumber: 'A003', adminId: savedAdmin1._id },
            { name: 'Sarah Williams', rollNumber: 'A004', adminId: savedAdmin1._id },
            { name: 'David Brown', rollNumber: 'A005', adminId: savedAdmin1._id },
            { name: 'Emily Davis', rollNumber: 'A006', adminId: savedAdmin1._id },
            { name: 'Robert Wilson', rollNumber: 'A007', adminId: savedAdmin1._id },
            { name: 'Lisa Anderson', rollNumber: 'A008', adminId: savedAdmin1._id },
            { name: 'James Taylor', rollNumber: 'A009', adminId: savedAdmin1._id },
            { name: 'Mary Thomas', rollNumber: 'A010', adminId: savedAdmin1._id }
        ];

        // Create students for admin2
        const admin2Students = [
            { name: 'Alex Rodriguez', rollNumber: 'B001', adminId: savedAdmin2._id },
            { name: 'Sophia Martinez', rollNumber: 'B002', adminId: savedAdmin2._id },
            { name: 'Daniel Garcia', rollNumber: 'B003', adminId: savedAdmin2._id },
            { name: 'Olivia Hernandez', rollNumber: 'B004', adminId: savedAdmin2._id },
            { name: 'William Lopez', rollNumber: 'B005', adminId: savedAdmin2._id },
            { name: 'Ava Gonzalez', rollNumber: 'B006', adminId: savedAdmin2._id },
            { name: 'Joseph Perez', rollNumber: 'B007', adminId: savedAdmin2._id },
            { name: 'Isabella Torres', rollNumber: 'B008', adminId: savedAdmin2._id },
            { name: 'Charles Flores', rollNumber: 'B009', adminId: savedAdmin2._id },
            { name: 'Mia Rivera', rollNumber: 'B010', adminId: savedAdmin2._id }
        ];

        // Save students one by one to avoid bulk write errors
        for (const student of [...admin1Students, ...admin2Students]) {
            await new Student(student).save();
        }

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

// Run the seed function
seedData(); 