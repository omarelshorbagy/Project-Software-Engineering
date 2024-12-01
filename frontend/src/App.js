import React, { useState, useEffect } from 'react';
//import axios from 'axios';
import './App.css';
import Footer from './components/Footer/Footer.js';
import Landingpage from './Pages/Landingpage.js';
import HomePage from './Pages/Homepage.js';
import LoginPage from './Pages/LoginPage.js';
import RegisterPage from './Pages/RegisterPage.js';
import DocumentShare from './components/Documentshare/DocumentUpload.js';
import Chat from './components/chat/chat.js';
import VideoConference from './components/VideoConference/VideoChat.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUsername, setCurrentUsername] = useState('');

  // Check token and username on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    if (token && storedUsername) {
      setLoggedIn(true);
      setCurrentUsername(storedUsername);
    }
  }, []);

  // Update login state after successful login from LoginPage
  const handleLoginSuccess = (username, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    setCurrentUsername(username);
    setLoggedIn(true);
  };

  // Handle logout with chat history clearing
  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear authentication token
    localStorage.removeItem('username'); // Clear stored username
    clearChatHistory(); // Clear chat history from localStorage
    setLoggedIn(false); // Update state to log user out
    setCurrentUsername(''); // Clear username state
  };

  // Clear chat history in localStorage
  const clearChatHistory = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('chatHistory_')) {
        localStorage.removeItem(key);
      }
    });
  };

  return (
    <Router>
      <div className="App">
        {/* Navbar with Bootstrap styling */}
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <Link className="navbar-brand" to="/">My Website</Link>
          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ml-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/">Home</Link>
              </li>
              {loggedIn && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/chat">Chat</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/VideoConference">Video Conference</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/Documentshare">Document Share</Link>
                  </li>
                </>
              )}
              {loggedIn ? (
                <li className="nav-item">
                  <button className="nav-link btn btn-link" onClick={handleLogout}>
                    Logout ({currentUsername})
                  </button>
                </li>
              ) : (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/login">Login</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/register">Register</Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </nav>

        {/* Main container */}
        <main className="container mt-4">
          <Routes>
            <Route path="/" element={<HomePage isAuthenticated={loggedIn} />} />
            <Route
              path="/login"
              element={<LoginPage onLogin={handleLoginSuccess} />}
            />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/Landingpage" element={<Landingpage />} />
            <Route path="/Documentshare" element={loggedIn ? <DocumentShare /> : <Navigate to="/login" />} />
            {/* Pass room name and currentUsername to Chat and VideoConference components */}
            <Route
              path="/chat"
              element={loggedIn ? <Chat room="general" loggedIn={loggedIn} currentUsername={currentUsername} /> : <Navigate to="/login" />}
            />
            <Route
              path="/VideoConference"
              element={loggedIn ? <VideoConference currentUsername={currentUsername} /> : <Navigate to="/login" />}
            />
          </Routes>
        </main>

        {/* Footer component */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
