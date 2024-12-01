// Import necessary libraries
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Main component for the registration page
function RegisterPage() {
    // State variables to store form input values and status messages
    const [username, setUsername] = useState('');  // State for username input
    const [email, setEmail] = useState('');  // State for email input
    const [password, setPassword] = useState('');  // State for password input
    const [error, setError] = useState('');  // State for error message
    const [success, setSuccess] = useState('');  // State for success message
    const navigate = useNavigate();  // Hook to navigate to different routes

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();  // Prevent default form submission behavior

        try {
            // Send registration data to the backend
            const response = await axios.post('http://localhost:5000/api/auth/register', {
                username,
                email,
                password,
            });

            // If registration is successful, display success message and redirect to login
            if (response.status === 200) {
                setSuccess('Registration successful! Redirecting to login...');
                setError('');
                setTimeout(() => {
                    navigate('/login');  // Redirect to login page after delay
                }, 1500);
            }
        } catch (err) {
            // Display error message if registration fails
            if (err.response && err.response.data && err.response.data.error) {
                setError(`Registration failed: ${err.response.data.error}`);
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
            setSuccess('');  // Clear success message if there's an error
        }
    };

    return (
        <div className="container mt-5">
            <h2>Register</h2>
            {/* Display error and success messages */}
            {error && <p className="text-danger">{error}</p>}
            {success && <p className="text-success">{success}</p>}

            {/* Registration form */}
            <form onSubmit={handleSubmit}>
                {/* Username input field */}
                <div className="form-group">
                    <label>Username</label>
                    <input
                        type="text"
                        className="form-control"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                {/* Email input field */}
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                {/* Password input field */}
                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {/* Submit button for the form */}
                <button type="submit" className="btn btn-primary mt-3">Register</button>
            </form>
        </div>
    );
}

export default RegisterPage;
