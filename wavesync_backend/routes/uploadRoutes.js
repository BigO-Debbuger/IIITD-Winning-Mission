// wavesync_backend/routes/uploadRoutes.js
import express from 'express';
import path from 'path';
import upload from '../middlewares/upload.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// @desc    Upload a single file and return URL (Cloudinary CDN URL or local static upload URL)
// @route   POST /api/upload
router.post('/', protect, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Cloudinary returns full URL in path; diskStorage returns local file path
    const fileUrl = req.file.path.startsWith('http://') || req.file.path.startsWith('https://')
      ? req.file.path
      : `/uploads/${path.basename(req.file.path)}`;

    res.status(200).json({ 
      message: 'File uploaded successfully', 
      url: fileUrl 
    });
  } catch (error) {
    res.status(500).json({ message: 'File upload failed', error: error.message });
  }
});

export default router;