// auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Ensure this path is correct

// Register Route
router.post('/register', authController.register);

// Login Route
router.post('/login', authController.login);

module.exports = router;
