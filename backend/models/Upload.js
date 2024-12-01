// Import mongoose to define the schema and model
const mongoose = require('mongoose');

// Define the schema for an uploaded file
const uploadSchema = new mongoose.Schema({
    // Name of the file, stored as a string and required
    filename: { type: String, required: true },

    // Path where the file is stored, also required
    filepath: { type: String, required: true },

    // Optional comment or description about the file, stored as a string
    comment: { type: String },

    // Date when the file was uploaded, defaults to the current date and time
    uploadDate: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Upload || mongoose.model('Upload', uploadSchema);
