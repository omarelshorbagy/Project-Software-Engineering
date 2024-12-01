// Import mongoose to define the schema and model
const mongoose = require('mongoose');

// Define the schema for a user
const userSchema = new mongoose.Schema({
    // Username, which must be unique and is required
    username: { type: String, required: true, unique: true },

    // Email address, which must also be unique and is required
    email: { type: String, required: true, unique: true },

    // Password for the user, stored as a hashed string, required
    password: { type: String, required: true },

    // Date when the user account was created, defaults to the current date and time
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
