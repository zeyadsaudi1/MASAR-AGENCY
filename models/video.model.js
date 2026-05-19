const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    link: { type: String }, // Optional, could be an external link
    price: { type: Number, required: true },
    imagePath: { type: String, required: true },
    videoPath: { type: String }, // Path on the server if uploaded
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);
