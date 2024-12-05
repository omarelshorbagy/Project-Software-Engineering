# Project Title: Web Application for Real-Time Communication and File Sharing

This project is a modular web application designed for real-time communication and document sharing. The application supports user authentication, file uploads, chat, and video conferencing functionalities. The project was developed using the MERN (MongoDB, Express.js, React, Node.js) stack and deployed on Render for cloud hosting.

## Features
- **User Authentication**: Secure registration and login using JWT.
- **Document Upload**: Upload and manage PDF documents with comments.
- **Real-Time Chat**: Group chat with real-time updates.
- **Video Conferencing**: Join or create rooms for video meetings.
- **Docker Support**: Containerized application for consistent deployment.
- **Cloud Hosting**: Deployed backend and frontend using Render.

## Technology Stack
- **Frontend**: React
- **Backend**: Node.js with Express
- **Database**: MongoDB (Atlas)
- **Real-Time Communication**: WebSocket and Socket.IO
- **Containerization**: Docker
- **Hosting**: Render

## Installation and Setup
### Prerequisites
- Node.js (v14 or higher)
- Docker (optional)
- Git

### Backend Setup
git clone https://github.com/omarelshorbagy/Project-Software-Engineering/tree/main/backend
   cd your-repository
   cd backend
   npm install
   npm server.js //start the backend
 ## Create a .env file in the backend directory
 PORT=5000
 MONGO_URI=<your-mongodb-atlas-uri>
 JWT_SECRET=<your-jwt-secret>
## Frontend Setup
cd frontend
npm install
npm start
## Docker Setup
Ensure Docker is installed and running.
Run the following command from the project root:
   docker-compose up

## Deployment
The application is hosted on Render:
Backend: https://project-software-engineering.onrender.com
Frontend: https://project-software-engineering-1.onrender.com   

## Testing
Use Postman to test API endpoints.
Example for testing the login endpoint:
Method: POST
URL: https://project-software-engineering.onrender.com/api/auth/login
Body:
{
  "email": "example@example.com",
  "password": "password123"
}

## Lessons Learned
Understanding the nuances of real-time communication using WebSocket and Socket.IO.
Handling cross-origin resource sharing (CORS) during deployment.
Working with Docker to ensure consistent environments.
The importance of detailed documentation for smooth deployment and maintenance.

 

   
