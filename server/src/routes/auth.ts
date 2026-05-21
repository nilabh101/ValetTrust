import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const router = express.Router();

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

router.post('/register', async (req, res) => {
  try {
    const { name, phone, password, role } = req.body;
    const userExists = await User.findOne({ phone });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, phone, password, role });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id.toString())
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user: any = await User.findOne({ phone });
    
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id.toString())
      });
    } else {
      res.status(401).json({ message: 'Invalid phone or password' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
