import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io.connect('https://project-software-engineering.onrender.com'); // Replace with your server URL

function Chat({ loggedIn, currentUsername }) {
    const [room, setRoom] = useState('');
    const [isRoomSelected, setIsRoomSelected] = useState(false);
    const [message, setMessage] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [error, setError] = useState('');

    // Handle creating a new room
    const handleCreateRoom = () => {
        if (!room.trim()) return;
        socket.emit('create_room', room, (response) => {
            if (response.success) {
                setIsRoomSelected(true);
                setError('');
                socket.emit('join_room', room);
                localStorage.setItem(`chatHistory_${room}`, JSON.stringify([])); // Initialize empty history
            } else {
                setError(response.message || 'Room already exists.');
            }
        });
    };

    // Handle joining an existing room
    const handleJoinRoom = () => {
        if (!room.trim()) return;
        socket.emit('check_room', room, (response) => {
            if (response.exists) {
                setIsRoomSelected(true);
                setError('');
                socket.emit('join_room', room, (joinResponse) => {
                    if (joinResponse && !joinResponse.success) {
                        setError(joinResponse.message || 'Could not join the room.');
                    }
                });
                const savedHistory = JSON.parse(localStorage.getItem(`chatHistory_${room}`)) || [];
                setChatMessages(savedHistory);
            } else {
                setError('This room does not exist.');
            }
        });
    };

    // Receive messages for the current room
    useEffect(() => {
        if (isRoomSelected) {
            const handleMessageReceive = (data) => {
                setChatMessages((prevMessages) => {
                    const updatedMessages = [...prevMessages, data];
                    localStorage.setItem(`chatHistory_${room}`, JSON.stringify(updatedMessages));
                    return updatedMessages;
                });
            };

            // Listen for new messages in the selected room
            socket.on('receive_message', handleMessageReceive);

            // Clean up listener on unmount
            return () => {
                socket.off('receive_message', handleMessageReceive);
            };
        }
    }, [isRoomSelected, room]);

    const sendMessage = () => {
        if (message.trim() && isRoomSelected) {
            const newMessage = {
                room,
                user: currentUsername || 'Anonymous', // Use currentUsername or fallback to 'Anonymous'
                message,
                time: new Date().toLocaleString()
            };
            socket.emit('send_message', newMessage);

            setChatMessages((prevMessages) => {
                const updatedMessages = [...prevMessages, newMessage];
                localStorage.setItem(`chatHistory_${room}`, JSON.stringify(updatedMessages));
                return updatedMessages;
            });
            setMessage('');
        }
    };

    return (
        <div style={styles.container}>
            {!isRoomSelected ? (
                <div style={styles.roomSelection}>
                    <h2>Enter Chat Room</h2>
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
                <div style={styles.chatContainer}>
                    <div style={styles.chatBox}>
                        <h3>Chat History</h3>
                        {chatMessages.map((msg, index) => (
                            <p key={index}><b>{msg.user}</b>: {msg.message} <em>({msg.time})</em></p>
                        ))}
                    </div>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        style={styles.input}
                    />
                    <button onClick={sendMessage} style={styles.button}>Send</button>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: { padding: '20px' },
    roomSelection: { textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    chatContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
    chatBox: { maxHeight: '300px', overflowY: 'scroll', border: '1px solid #ddd', padding: '10px', width: '80%' },
    input: { width: '80%', padding: '10px', margin: '10px 0' },
    button: { padding: '10px', backgroundColor: '#5a9', color: '#fff', borderRadius: '5px', cursor: 'pointer', border: 'none', margin: '5px' },
    error: { color: 'red', fontWeight: 'bold' }
};

export default Chat;
