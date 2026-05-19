const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    subjectAr: { type: String, required: true },
    bio: { type: String, required: true },
    studentsCount: { type: Number, default: 0 },
    rating: { type: Number, default: 5 },
    imagePath: { type: String, required: true },
    grades: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);
