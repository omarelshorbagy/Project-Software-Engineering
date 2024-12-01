const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Normalize email by trimming whitespace and converting to lowercase
        const normalizedEmail = email.trim().toLowerCase();
        console.log(`Registering with normalized email: ${normalizedEmail}`);

        // Check if the username or email is already in use
        const existingUser = await User.findOne({ $or: [{ email: normalizedEmail }, { username }] });
        if (existingUser) {
            return res.status(400).json({
                error: existingUser.email === normalizedEmail
                    ? 'Email is already in use.'
                    : 'Username is already taken.'
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user with the normalized email and hashed password
        const newUser = new User({ username, email: normalizedEmail, password: hashedPassword });
        await newUser.save();

        console.log(`User registered successfully with email: ${normalizedEmail}`);
        res.json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error.message || error);
        res.status(500).json({ error: 'Registration failed. Please try again later.' });
    }
};

// Login User
exports.login = async (req, res) => {
    const requestId = Math.floor(Math.random() * 10000); // Unique ID for each request for debugging
    console.log(`\n[${requestId}] Incoming login request:`, req.body);

    const rawEmail = req.body.email;
    const rawPassword = req.body.password;

    // Check for both email and password in the request
    if (!rawEmail || !rawPassword) {
        console.log(`[${requestId}] Incomplete login request: missing email or password.`);
        return res.status(400).json({ error: 'Email and password are required' });
    }

    // Normalize email by trimming whitespace and converting to lowercase
    const normalizedEmail = rawEmail.trim().toLowerCase();
    console.log(`[${requestId}] Attempting to log in with normalized email: ${normalizedEmail}`);
    console.log(`[${requestId}] Email received in request before normalization: ${rawEmail}`);

    try {
        // Find user by normalized email
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            console.log(`[${requestId}] No user found with this email in the database: ${normalizedEmail}`);

            // Print out all users in the database for debugging
            const allUsers = await User.find({});
            console.log(`[${requestId}] All users in the database (for debugging purposes):`, allUsers.map(u => u.email));

            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Compare the provided password with the hashed password in the database
        const isPasswordMatch = await bcrypt.compare(rawPassword, user.password);
        if (!isPasswordMatch) {
            console.log(`[${requestId}] Password mismatch for email: ${normalizedEmail}`);
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Ensure JWT secret is defined
        if (!process.env.JWT_SECRET) {
            console.error(`[${requestId}] JWT_SECRET is not defined in the environment variables.`);
            return res.status(500).json({ error: 'Configuration error. Please try again later.' });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Include username in the response
        res.status(200).json({ message: 'Login successful', token, username: user.username });
    } catch (error) {
        console.error(`[${requestId}] Login error:`, error.message || error);
        res.status(500).json({ error: 'Login failed. Please try again later.' });
    }
};
