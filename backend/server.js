require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const socketIo = require('socket.io');
const http = require('http');
const { connectDB } = require('./config/db');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');  // Required for authentication middleware

const app = express();
const server = http.createServer(app);

// Set up Socket.IO with CORS configuration
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ["GET", "POST", "PUT", "DELETE"],
    }
});

// Connect to MongoDB
connectDB();

// Middleware for CORS and JSON parsing
app.use(cors({
    origin: 'http://localhost:3000',
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authentication Middleware for Protected Routes
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Expecting 'Bearer <token>'
    if (!token) return res.status(403).json({ error: 'Access denied. No token provided.' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token.' });
    }
};

// Create uploads directory if it doesn't exist
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Serve static files from the uploads directory
app.use('/uploads', express.static(uploadDir));

// Routes
const authRoutes = require('./routes/auth');
const groupRoutes = require('./routes/group');
const documentRoutes = require('./routes/upload');

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/upload', authenticateToken, (req, res, next) => {
    console.log('Upload route accessed');
    next();
}, documentRoutes);

// In-memory storage for rooms and active users
const rooms = {};
const activeUsers = {};

// Real-time chat and video conferencing with Socket.IO
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle room creation
    socket.on('create_room', (roomName, callback) => {
        if (!rooms[roomName]) {
            rooms[roomName] = { members: [] };
            console.log(`Room ${roomName} created`);
            if (typeof callback === 'function') callback({ success: true });
        } else {
            if (typeof callback === 'function') callback({ success: false, message: 'Room already exists.' });
        }
    });

    // Check if a room exists before joining
    socket.on('check_room', (roomName, callback) => {
        if (rooms[roomName]) {
            if (typeof callback === 'function') callback({ exists: true });
        } else {
            if (typeof callback === 'function') callback({ exists: false, message: 'Room does not exist.' });
        }
    });

    // Handle joining a chat or video room, including username
    socket.on('join_room', ({ room, username }, callback) => {
        if (rooms[room]) {
            rooms[room].members.push({ socketId: socket.id, username });
            activeUsers[socket.id] = username;
            socket.join(room);
            console.log(`User ${username} with socket ID ${socket.id} joined room ${room}`);
            if (typeof callback === 'function') callback({ success: true });
            io.emit('update_active_users', Object.values(activeUsers)); // Update active users list
        } else {
            console.log(`Attempt to join non-existent room: ${room}`);
            if (typeof callback === 'function') callback({ success: false, message: 'This room does not exist.' });
        }
    });

    // Handle sending messages in chat
    socket.on('send_message', (data) => {
        io.to(data.room).emit('receive_message', {
            user: data.user,
            message: data.message,
            timestamp: new Date().toLocaleString()
        });
        console.log(`Message from ${data.user} in room ${data.room}: ${data.message}`);
    });

    // Video conferencing events
    socket.on('join_video_room', (room) => {
        socket.join(room);
        socket.broadcast.to(room).emit('user_connected', socket.id);
    });

    socket.on('offer', (data) => {
        socket.to(data.room).emit('offer', data.sdp);
    });

    socket.on('answer', (data) => {
        socket.to(data.room).emit('answer', data.sdp);
    });

    socket.on('ice-candidate', (data) => {
        socket.to(data.room).emit('ice-candidate', data.candidate);
    });

    // Clean up on disconnect
    socket.on('disconnect', () => {
        for (const room in rooms) {
            const index = rooms[room].members.findIndex(member => member.socketId === socket.id);
            if (index !== -1) {
                const username = rooms[room].members[index].username;
                rooms[room].members.splice(index, 1);
                delete activeUsers[socket.id];
                if (rooms[room].members.length === 0) {
                    delete rooms[room]; // Delete room if empty
                }
                console.log(`User ${username} with socket ID ${socket.id} disconnected from room ${room}`);
                io.emit('update_active_users', Object.values(activeUsers)); // Update active users list
                break;
            }
        }
    });
});

// Endpoint to get active users (for frontend use)
app.get('/api/active-users', (req, res) => {
    res.json(Object.values(activeUsers));
});

// Start server  
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
