import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DocumentUpload() {
    const [file, setFile] = useState(null);
    const [comment, setComment] = useState('');
    const [message, setMessage] = useState('');
    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetchHistory();
    }, []);

    // Fetch upload history
    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token'); // Get the token from localStorage
            const res = await axios.get('http://localhost:5000/api/upload/history', {
                headers: {
                    Authorization: `Bearer ${token}`, // Add the token to the Authorization header
                },
            });
            setHistory(res.data);
        } catch (error) {
            console.error('Error fetching upload history:', error);
            setMessage('Error fetching upload history. Please try again.');
        }
    };

    // Handle file upload
    const uploadFile = async () => {
        if (!file) {
            setMessage('Please select a file to upload.');
            return;
        }

        const validFileTypes = ['application/pdf'];
        if (!validFileTypes.includes(file.type)) {
            setMessage('Please upload a PDF file.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('comment', comment);

        try {
            const token = localStorage.getItem('token'); // Get the token from localStorage
            const res = await axios.post('http://localhost:5000/api/upload', formData, {
                headers: {
                    Authorization: `Bearer ${token}`, // Add the token to the Authorization header
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (res.status === 200) {
                setMessage('File uploaded successfully!');
                fetchHistory(); // Refresh history after upload
                setFile(null);
                setComment('');
            } else {
                setMessage('Error uploading file. Please try again.');
            }
        } catch (error) {
            console.error('Upload error:', error.response || error.message);
            setMessage('Error uploading file. Please check the console for details.');
        }
    };

    // Delete a specific file
    const deleteFile = async (id) => {
        try {
            const token = localStorage.getItem('token'); // Get the token from localStorage
            await axios.delete(`http://localhost:5000/api/upload/delete/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Add the token to the Authorization header
                },
            });
            setMessage('File deleted successfully.');
            fetchHistory(); // Refresh history after deletion
        } catch (error) {
            console.error('Error deleting file:', error.response || error.message);
            setMessage('Error deleting file. Please try again.');
        }
    };

    // Clear upload history
    const clearHistory = async () => {
        try {
            const token = localStorage.getItem('token'); // Get the token from localStorage
            await axios.post('http://localhost:5000/api/upload/clear-history', null, {
                headers: {
                    Authorization: `Bearer ${token}`, // Add the token to the Authorization header
                },
            });
            setMessage('History cleared successfully.');
            fetchHistory(); // Refresh history after clearing
        } catch (error) {
            console.error('Error clearing history:', error.response || error.message);
            setMessage('Error clearing history. Please try again.');
        }
    };

    return (
        <div>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment about this document"
                rows="3"
                style={{ width: '100%', marginTop: '10px' }}
            />
            <button onClick={uploadFile} style={{ marginTop: '10px' }}>Upload Document</button>
            {message && <p>{message}</p>}

            {/* Clear History Button */}
            <button onClick={clearHistory} style={{ marginTop: '10px', color: 'red' }}>
                Clear Upload History
            </button>

            {/* Display history */}
            <div>
                <h3>Upload History</h3>
                <ul>
                    {history.map((entry) => (
                        <li key={entry._id}>
                            <strong>{entry.filename}</strong> - {entry.comment} <em>({new Date(entry.uploadDate).toLocaleString()})</em>
                            <br />
                            <a href={`http://localhost:5000${entry.filepath}`} download>
                                Download
                            </a>
                            <button onClick={() => deleteFile(entry._id)} style={{ marginLeft: '10px', color: 'red' }}>
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default DocumentUpload;
