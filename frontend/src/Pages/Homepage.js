import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Homepage.css'; // Add a CSS file for additional styling

function HomePage({ isAuthenticated }) {
    const navigate = useNavigate();

    // Handle feature click with authentication check
    const handleFeatureClick = (path) => {
        console.log("Authenticated:", isAuthenticated); // Debugging line

        if (isAuthenticated) {
            navigate(path); // Direct to the feature page if logged in
        } else {
            navigate('/login'); // Redirect to login if not authenticated
        }
    };

    return (
        <div className="homepage">
            <header className="homepage-header">
                <h1>Welcome to My Web Application</h1>
                <p>Explore our features designed to enhance your productivity.</p>
            </header>
            <main className="homepage-main">
                <div className="feature-cards">
                    {/* Document Share Feature */}
                    <div className="feature-card" onClick={() => handleFeatureClick('/Documentshare')}>
                        <h2>Document Share</h2>
                        <p>Upload, download, and manage your documents securely.</p>
                    </div>

                    {/* Chat Feature */}
                    <div className="feature-card" onClick={() => handleFeatureClick('/chat')}>
                        <h2>Chat</h2>
                        <p>Stay connected with colleagues and team members in real-time.</p>
                    </div>

                    {/* Video Conference Feature */}
                    <div className="feature-card" onClick={() => handleFeatureClick('/VideoConference')}>
                        <h2>Video Conference</h2>
                        <p>Connect face-to-face with video conferencing functionality.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default HomePage;
