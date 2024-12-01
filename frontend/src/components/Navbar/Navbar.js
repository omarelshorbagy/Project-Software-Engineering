// Import necessary libraries and components
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';

// Establish a socket connection to the backend server
const socket = io.connect('http://localhost:5000');

// Navbar component to handle navigation and active users display
function Navbar({ loggedIn, setLoggedIn, currentUsername }) {
    // State to store list of active users
    const [activeUsers, setActiveUsers] = useState([]);

    // useEffect hook to fetch active users and handle socket events on component mount
    useEffect(() => {
        // Function to fetch active users from the server
        const fetchActiveUsers = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/active-users');
                setActiveUsers(response.data); // Set fetched users to state
            } catch (error) {
                console.error('Error fetching active users:', error);
            }
        };

        fetchActiveUsers(); // Initial fetch of active users

        // Listen for updates to the active user list from the server
        socket.on('update_active_users', (users) => {
            setActiveUsers(users);
        });

        // Emit login event to the server when user is logged in and username is set
        if (loggedIn && currentUsername) {
            socket.emit('user_logged_in', currentUsername);
        }

        // Cleanup function to remove the active users update listener on unmount
        return () => {
            socket.off('update_active_users');
        };
    }, [loggedIn, currentUsername]);

    // Logout function to clear data and notify the server
    const handleLogout = async () => {
        try {
            // Clear upload history on the server
            await axios.post('http://localhost:5000/api/upload/clear-history');

            // Emit logout event to the server if username exists
            if (currentUsername) {
                socket.emit('user_logged_out', currentUsername);
            }

            // Clear token from local storage, update login state, and redirect to login page
            localStorage.removeItem('token');
            setLoggedIn(false);
            window.location.href = '/login';
        } catch (error) {
            console.error("Error clearing user history:", error);
        }
    };

    // JSX to render the navbar component
    return (
        <nav style={styles.nav}>
            <h2 style={styles.title}>My Web Application</h2>
            <ul style={styles.links}>
                {/* Main navigation links */}
                <li><Link to="/" style={styles.link}>Home</Link></li>

                {/* Conditionally render Login and Register links if user is not logged in */}
                {!loggedIn ? (
                    <>
                        <li><Link to="/login" style={styles.link}>Login</Link></li>
                        <li><Link to="/register" style={styles.link}>Register</Link></li>
                    </>
                ) : (
                    // Render Logout button if user is logged in
                    <li>
                        <button onClick={handleLogout} style={{ ...styles.link, backgroundColor: 'red' }}>
                            Logout
                        </button>
                    </li>
                )}

                {/* Other navigation links available to all users */}
                <li><Link to="/chat" style={styles.link}>Chat</Link></li>
                <li><Link to="/video" style={styles.link}>Video Conference</Link></li>
                <li><Link to="/document-share" style={styles.link}>Document Share</Link></li>

                {/* Display active users list only when logged in */}
                {loggedIn && (
                    <li style={styles.activeUsers}>
                        <b>Active Users:</b> {activeUsers.join(', ')}
                    </li>
                )}
            </ul>
        </nav>
    );
}

// Styles object for styling navbar elements
const styles = {
    nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#333', color: '#fff' },
    title: { margin: 0 },
    links: { display: 'flex', gap: '1rem', listStyle: 'none', padding: 0 },
    link: { color: '#fff', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '5px', backgroundColor: '#555', transition: 'background-color 0.3s' },
    activeUsers: { marginLeft: '1rem', color: '#5a9' }
};

// Export the Navbar component for use in other parts of the application
export default Navbar;
