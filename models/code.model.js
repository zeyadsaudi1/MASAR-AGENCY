const mongoose = require('mongoose');

const codeSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
    videoTitle: { type: String }, // Cached for convenience
    value: { type: Number, required: true },
    used: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Code', codeSchema);
