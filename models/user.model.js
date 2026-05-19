const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    birthDate: { type: Date, required: true },
    phone: { type: String, required: true, unique: true },
    parentPhone: { type: String, required: true },
    nationalId: { type: String, required: true, unique: true },
    governorate: { type: String, required: true },
    grade: { type: String, required: true },
    section: { type: String }, // Optional for prep school
    secondLanguage: { type: String }, // Optional for prep school
    password: { type: String, required: true },
    balance: { type: Number, default: 0 },
    role: { type: String, enum: ['student', 'admin'], default: 'student' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
