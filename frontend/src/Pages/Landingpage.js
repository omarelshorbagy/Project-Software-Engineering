// src/Pages/HomePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Landingpage.css';

function Landingpage() {
    const navigate = useNavigate();

    const handleFeatureClick = (path) => {
        navigate(path);
    };

    return (
        <div className="Landing-page">
            <h1>Welcome to the Application!</h1>
            <div className="feature-cards">
                <div className="feature-card" onClick={() => handleFeatureClick('/documentshare')}>
                    <h2>Document Share</h2>
                    <p>Share and manage your documents easily.</p>
                </div>
                <div className="feature-card" onClick={() => handleFeatureClick('/chat')}>
                    <h2>Chat</h2>
                    <p>Stay connected with real-time messaging.</p>
                </div>
                <div className="feature-card" onClick={() => handleFeatureClick('/videoconference')}>
                    <h2>Video Conference</h2>
                    <p>Host and join video meetings seamlessly.</p>
                </div>
            </div>
        </div>
    );
}

export default Landingpage;

