import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';

const router = express.Router();

function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

router.post('/register', [
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().notEmpty().withMessage('Name is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { phone, password, name } = req.body;
    const normalizedPhone = phone.replace(/\D/g, '');
    const exists = await User.findOne({ phone: normalizedPhone });
    if (exists) {
      return res.status(400).json({ message: 'An account with this phone number already exists' });
    }
    const user = await User.create({
      phone: normalizedPhone,
      password,
      name,
    });
    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        bio: user.bio,
        photo: user.photo,
        connections: user.connections,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', [
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { phone, password } = req.body;
    const normalizedPhone = phone.replace(/\D/g, '');
    const user = await User.findOne({ phone: normalizedPhone }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid phone or password' });
    }
    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid phone or password' });
    }
    const token = generateToken(user._id);
    res.json({
      token,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        bio: user.bio,
        photo: user.photo,
        connections: user.connections,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
