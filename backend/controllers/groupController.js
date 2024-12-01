// Import the Group model to interact with the database
const Group = require('../models/Group');

// Controller function to create a new group
exports.createGroup = async (req, res) => {
    try {
        // Instantiate a new Group with data from the request body
        const newGroup = new Group(req.body);

        // Save the new group to the database
        await newGroup.save();

        // Respond with a success message if group creation is successful
        res.json({ message: 'Group created successfully' });
    } catch (error) {
        // Respond with an error message if group creation fails
        res.status(500).json({ error: 'Group creation failed' });
    }
};

// Controller function to retrieve all groups
exports.getGroups = async (req, res) => {
    try {
        // Query the database to find all groups
        const groups = await Group.find();

        // Respond with the list of groups
        res.json(groups);
    } catch (error) {
        // Respond with an error message if retrieval fails
        res.status(500).json({ error: 'Could not retrieve groups' });
    }
};
