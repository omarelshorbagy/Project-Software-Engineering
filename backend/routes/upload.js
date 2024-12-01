const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const Upload = require('../models/Upload'); // Ensure this model exists

// Define the base upload directory
const baseUploadDir = path.join(__dirname, '../uploads');

// Configure Multer storage with a single directory
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ensure the upload directory exists
        if (!fs.existsSync(baseUploadDir)) {
            fs.mkdirSync(baseUploadDir, { recursive: true });
        }
        cb(null, baseUploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Ensure unique filenames
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        // Restrict to PDF files only
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    },
}).single('file');

// Upload endpoint
router.post('/', (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error('Error during file upload:', err);
            return res.status(400).json({ message: err.message });
        }

        const { comment } = req.body;

        // Save upload information in the database
        const newUpload = new Upload({
            filename: req.file.filename,
            filepath: path.join('/uploads', req.file.filename), // Relative path for accessing the file
            comment,
            uploadDate: new Date(),
        });

        try {
            await newUpload.save();
            res.status(200).json({ message: 'File uploaded successfully!', filepath: newUpload.filepath });
        } catch (error) {
            console.error('Error saving upload information:', error);
            res.status(500).json({ message: 'Error saving upload information' });
        }
    });
});

// Fetch upload history
router.get('/history', async (req, res) => {
    try {
        const history = await Upload.find().sort({ uploadDate: -1 });
        res.json(history);
    } catch (error) {
        console.error('Error fetching upload history:', error);
        res.status(500).json({ message: 'Error fetching upload history' });
    }
});

// Delete a specific file by ID
router.delete('/delete/:id', async (req, res) => {
    try {
        const upload = await Upload.findById(req.params.id);
        if (!upload) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Remove the file from the filesystem
        const filePath = path.join(baseUploadDir, upload.filename);
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(`Error deleting file: ${filePath}`, err);
            }
        });

        // Remove the record from the database
        await Upload.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ message: 'Error deleting file' });
    }
});

// Clear upload history
router.post('/clear-history', async (req, res) => {
    try {
        const uploads = await Upload.find();
        for (const upload of uploads) {
            const filePath = path.join(baseUploadDir, upload.filename);
            fs.unlink(filePath, (err) => {
                if (err) console.error(`Failed to delete file from filesystem: ${filePath}`, err);
            });
        }

        // Delete records from the database
        await Upload.deleteMany();
        res.status(200).json({ message: 'History cleared successfully' });
    } catch (error) {
        console.error('Error clearing history:', error);
        res.status(500).json({ message: 'Error clearing history' });
    }
});

module.exports = router;
