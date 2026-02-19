import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('connections', 'name photo bio');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/search', protect, async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json([]);
    const users = await User.find({
      _id: { $ne: req.user.id },
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
      ],
    })
      .select('name photo bio')
      .limit(20);
    const withStatus = users.map((u) => ({
      ...u.toObject(),
      isConnected: req.user.connections.some((c) => c.toString() === u._id.toString()),
    }));
    res.json(withStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/profile', protect, [
  body('name').optional().trim().isLength({ max: 100 }),
  body('bio').optional().trim().isLength({ max: 500 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, bio, photo } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (photo !== undefined) updates.photo = photo;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name photo bio connections')
      .populate('connections', 'name photo bio');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const isConnected = req.user.connections.some((c) => c.toString() === req.params.id);
    res.json({ ...user.toObject(), isConnected });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/connect/:id', protect, async (req, res) => {
  try {
    const targetId = req.params.id;
    if (targetId === req.user.id) {
      return res.status(400).json({ message: 'Cannot connect with yourself' });
    }
    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ message: 'User not found' });
    const already = req.user.connections.some((c) => c.toString() === targetId);
    if (already) return res.status(400).json({ message: 'Already connected' });
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { connections: targetId } });
    await User.findByIdAndUpdate(targetId, { $addToSet: { connections: req.user.id } });
    res.json({ message: 'Connected successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/disconnect/:id', protect, async (req, res) => {
  try {
    const targetId = req.params.id;
    await User.findByIdAndUpdate(req.user.id, { $pull: { connections: targetId } });
    await User.findByIdAndUpdate(targetId, { $pull: { connections: req.user.id } });
    res.json({ message: 'Disconnected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
