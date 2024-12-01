// Import express to create a router for group-related routes
const express = require('express');

// Import functions for handling group creation and retrieval from the groupController
const { createGroup, getGroups } = require('../controllers/groupController');

// Create a router instance to manage routes related to groups
const router = express.Router();

// Define a POST route to create a new group, calling the createGroup function from the controller
router.post('/create', createGroup);

// Define a GET route to retrieve all groups, calling the getGroups function from the controller
router.get('/', getGroups);

module.exports = router;
