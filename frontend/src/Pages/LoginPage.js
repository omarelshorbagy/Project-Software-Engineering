import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function LoginPage({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // Prevent multiple submissions
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        if (isSubmitting) return; // Prevent multiple submissions

        // Check if email contains '@' symbol
        if (!email.includes('@')) {
            setError('Please enter a valid email address.');
            return;
        }

        setIsSubmitting(true); // Lock submission until response
        setError(''); // Clear any previous errors
        setSuccess(''); // Clear any previous success message

        // Log form data for debugging
        console.log('Preparing to send login request with email:', email, 'and password:', password);

        try {
            // Normalize the email
            const normalizedEmail = email.trim().toLowerCase();
            console.log('Sending login request with normalized email:', normalizedEmail);

            const response = await axios.post('https://project-software-engineering.onrender.com/api/auth/login', {
                email: normalizedEmail,  // Use normalized email here
                password,
            });

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('username', response.data.username);
                onLogin(response.data.username, response.data.token); // Pass the username to App component
                setSuccess('Login successful!');

                setTimeout(() => {
                    navigate('/');
                }, 100);
            } else {
                setError('Login failed. Please check your credentials and try again.');
            }
        } catch (err) {
            console.error('Error during login:', err.response?.data || err.message);
            setError('Login failed. Please check your credentials and try again.');
        } finally {
            setIsSubmitting(false); // Reset submission lock
        }
    };

    return (
        <div className="container mt-5">
            <h2>Login</h2>
            {error && <p className="text-danger">{error}</p>}
            {success && <p className="text-success">{success}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isSubmitting} // Disable input during submission
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isSubmitting} // Disable input during submission
                    />
                </div>
                <button type="submit" className="btn btn-primary mt-3" disabled={isSubmitting}>
                    {isSubmitting ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
}

export default LoginPage;
