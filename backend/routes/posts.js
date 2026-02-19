import express from 'express';
import { body, validationResult } from 'express-validator';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// @route   GET /api/posts/user/:userId
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .populate('author', 'name photo')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/posts
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const connectionIds = [...user.connections, req.user.id];
    const posts = await Post.find({ author: { $in: connectionIds } })
      .populate('author', 'name photo')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/posts
router.post('/', protect, [
  body('text').optional().trim().isLength({ max: 2000 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { text, images = [], videos = [] } = req.body;
    const post = await Post.create({
      author: req.user.id,
      content: { text: text || '', images, videos },
    });
    const populated = await Post.findById(post._id).populate('author', 'name photo');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/posts/:id/comment
router.post('/:id/comment', protect, [
  body('text').trim().notEmpty().withMessage('Comment text is required').isLength({ max: 500 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    post.comments.push({
      user: req.user.id,
      text: req.body.text,
    });
    post.commentCount = post.comments.length;
    await post.save();
    const populated = await Post.findById(post._id)
      .populate('author', 'name photo')
      .populate('comments.user', 'name photo');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/posts/:id/share
router.post('/:id/share', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const alreadyShared = post.shares.some(
      (s) => s.user.toString() === req.user.id
    );
    if (alreadyShared) {
      return res.status(400).json({ message: 'Already shared' });
    }
    post.shares.push({ user: req.user.id });
    post.shareCount = post.shares.length;
    await post.save();
    const populated = await Post.findById(post._id)
      .populate('author', 'name photo')
      .populate('comments.user', 'name photo');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/posts/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
