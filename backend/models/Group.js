// Import the mongoose library to define a schema and model
const mongoose = require('mongoose');

// Define the schema for a Group
const GroupSchema = new mongoose.Schema({
    // Name of the group, stored as a string
    name: String,

    // Array of member references, where each member is an ObjectId referencing a User document
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('Group', GroupSchema);
