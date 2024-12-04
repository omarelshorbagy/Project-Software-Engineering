// Import necessary libraries
import React, { useRef, useEffect, useState } from 'react';
import io from 'socket.io-client';

// Initialize socket connection to server
const socket = io.connect('https://project-software-engineering.onrender.com'); // Replace with your server URL

// Main VideoChat component
function VideoChat({ currentUsername }) {
    // References and states for local and remote video, peer connection, room, messages, and errors
    const localVideoRef = useRef();  // Reference for local video
    const remoteVideoRef = useRef();  // Reference for remote video
    const peerConnectionRef = useRef();  // Reference for peer connection
    const [room, setRoom] = useState('');  // Room name state
    const [isRoomSelected, setIsRoomSelected] = useState(false);  // State to track if a room is selected
    const [message, setMessage] = useState('');  // Message input state
    const [chatMessages, setChatMessages] = useState([]);  // Array of chat messages
    const [error, setError] = useState('');  // Error message state

    // Load chat history from local storage for the specified room
    const loadChatHistory = (roomName) => {
        const savedHistory = JSON.parse(localStorage.getItem(`chatHistory_${roomName}`)) || [];
        setChatMessages(savedHistory);
    };

    // Function to create a new room
    const handleCreateRoom = () => {
        if (!room.trim()) return;  // Prevent empty room creation
        socket.emit('create_room', room, (response) => {
            if (response.success) {
                setIsRoomSelected(true);
                setError('');
                socket.emit('join_video_room', room);  // Join the room after creating
                loadChatHistory(room);  // Load previous chat history for the room
            } else {
                setError(response.message || 'Failed to create room.');
            }
        });
    };

    // Function to join an existing room
    const handleJoinRoom = () => {
        if (!room.trim()) return;  // Prevent empty room join
        socket.emit('check_room', room, (response) => {
            if (response.exists) {
                setIsRoomSelected(true);
                setError('');
                socket.emit('join_video_room', room);  // Join the selected room
                loadChatHistory(room);  // Load previous chat history for the room
            } else {
                setError('This room does not exist.');
            }
        });
    };

    // Setup video connection and event listeners once the room is selected
    useEffect(() => {
        if (isRoomSelected) {
            // Configure ICE servers for the peer connection
            const servers = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
            peerConnectionRef.current = new RTCPeerConnection(servers);

            // Request access to user's video and audio
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then((stream) => {
                    // Display local video stream
                    localVideoRef.current.srcObject = stream;
                    // Add local video tracks to the peer connection
                    stream.getTracks().forEach((track) => peerConnectionRef.current.addTrack(track, stream));
                }).catch((error) => {
                    console.error('Error accessing media devices:', error);
                });

            // Event listener for receiving an offer
            socket.on('offer', async (sdp) => {
                await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
                const answer = await peerConnectionRef.current.createAnswer();
                await peerConnectionRef.current.setLocalDescription(answer);
                socket.emit('answer', { room, sdp: peerConnectionRef.current.localDescription });
            });

            // Event listener for receiving an answer
            socket.on('answer', (sdp) => {
                peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
            });

            // Event listener for receiving ICE candidates
            socket.on('ice-candidate', (candidate) => {
                peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            });

            // Set remote video stream when a track is received
            peerConnectionRef.current.ontrack = (event) => {
                remoteVideoRef.current.srcObject = event.streams[0];
            };

            // Handle receiving messages in chat
            const handleMessageReceive = (data) => {
                setChatMessages((prevMessages) => {
                    const updatedMessages = [...prevMessages, data];
                    localStorage.setItem(`chatHistory_${room}`, JSON.stringify(updatedMessages));
                    return updatedMessages;
                });
            };

            // Add listener for receiving messages
            socket.on('receive_message', handleMessageReceive);

            // Cleanup socket listeners on component unmount
            return () => {
                socket.off('offer');
                socket.off('answer');
                socket.off('ice-candidate');
                socket.off('receive_message', handleMessageReceive);
            };
        }
    }, [room, isRoomSelected]);

    // Start video call by creating and sending an offer
    const startCall = async () => {
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);
        socket.emit('offer', { room, sdp: peerConnectionRef.current.localDescription });
    };

    // Function to send a chat message
    const sendMessage = () => {
        if (message.trim() && isRoomSelected) {
            const newMessage = { room, user: currentUsername, message, time: new Date().toLocaleString() };
            socket.emit('send_message', newMessage);

            setChatMessages((prevMessages) => {
                const updatedMessages = [...prevMessages, newMessage];
                localStorage.setItem(`chatHistory_${room}`, JSON.stringify(updatedMessages));
                return updatedMessages;
            });
            setMessage('');  // Clear the message input field
        }
    };

    // Handle "Enter" key press to send message
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div style={styles.container}>
            {/* Render room selection or video chat interface based on room selection */}
            {!isRoomSelected ? (
                <div style={styles.roomSelection}>
                    <h2>Enter Video Conference Room</h2>
                    <input
                        type="text"
                        placeholder="Enter room name..."
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                        style={styles.input}
                    />
                    <button onClick={handleCreateRoom} style={styles.button}>Create Room</button>
                    <button onClick={handleJoinRoom} style={styles.button}>Join Room</button>
                    {error && <p style={styles.error}>{error}</p>}
                </div>
            ) : (
                <div style={styles.videoChatContainer}>
                    {/* Video container for local and remote video */}
                    <div style={styles.videoContainer}>
                        <video ref={localVideoRef} autoPlay muted style={styles.video} />
                        <video ref={remoteVideoRef} autoPlay style={styles.video} />
                        <button onClick={startCall} style={styles.button}>Start Call</button>
                    </div>
                    {/* Chat container for messages */}
                    <div style={styles.chatContainer}>
                        <h3>Chat</h3>
                        <div style={styles.chatBox}>
                            {chatMessages.map((msg, index) => (
                                <p key={index}><b>{msg.user}</b>: {msg.message}</p>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message..."
                            onKeyDown={handleKeyDown}
                            style={styles.input}
                        />
                        <button onClick={sendMessage} style={styles.button}>Send</button>
                    </div>
                </div>
            )}
        </div>
    );
}

// CSS styles for the component elements
const styles = {
    container: { padding: '20px' },
    roomSelection: { textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    videoChatContainer: { display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '20px' },
    videoContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
    video: { width: '300px', borderRadius: '10px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)' },
    chatContainer: { maxWidth: '300px', border: '1px solid #ddd', borderRadius: '10px', padding: '10px', backgroundColor: '#f9f9f9' },
    chatBox: { maxHeight: '200px', overflowY: 'scroll', border: '1px solid #ddd', padding: '10px', marginBottom: '10px' },
    input: { width: '100%', padding: '8px', marginBottom: '10px' },
    button: { padding: '8px', backgroundColor: '#5a9', color: '#fff', borderRadius: '5px', cursor: 'pointer', border: 'none', margin: '5px' },
    error: { color: 'red', fontWeight: 'bold' }
};

export default VideoChat;
