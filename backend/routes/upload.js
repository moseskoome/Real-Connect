import express from 'express';
import { upload } from '../utils/upload.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/media', protect, upload.array('files', 10), (req, res) => {
  try {
    const files = (req.files || []).map((f) => `/uploads/${f.filename}`);
    res.json({ urls: files });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
