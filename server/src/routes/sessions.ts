import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect, authorize, AuthRequest } from '../middleware/auth';
import { Session } from '../models/Session';

const router = express.Router();

// Multer storage config for parking proof images
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${(req as any).user?._id || 'upload'}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

// Create a new parking session (Customer)
router.post('/', protect, authorize('customer'), async (req: AuthRequest, res) => {
  try {
    const { vehicleDetails } = req.body;
    const session = await Session.create({
      customer: req.user._id,
      vehicleDetails,
      status: 'pending'
    });
    res.status(201).json(session);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get sessions (Customer sees their own, Valet sees pending/assigned, Admin sees all)
router.get('/', protect, async (req: AuthRequest, res) => {
  try {
    let query = {};
    if (req.user.role === 'customer') query = { customer: req.user._id };
    else if (req.user.role === 'valet') query = { $or: [{ status: 'pending' }, { valet: req.user._id }] };
    
    const sessions = await Session.find(query).populate('customer valet', 'name phone').sort('-createdAt');
    res.json(sessions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Valet accepts a session
router.put('/:id/accept', protect, authorize('valet'), async (req: AuthRequest, res) => {
  try {
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { valet: req.user._id, status: 'handover' },
      { new: true }
    );
    if (!session) return res.status(404).json({ message: 'Session not found' });
    
    res.json(session);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update session status (Valet)
router.put('/:id/status', protect, authorize('valet'), async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.valet?.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

    const updateData: any = { status };
    if (status === 'parked') updateData.parkedAt = new Date();
    if (status === 'returned') updateData.returnedAt = new Date();

    const updatedSession = await Session.findByIdAndUpdate(req.params.id, updateData, { new: true });
    
    res.json(updatedSession);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Upload parking proof (Valet)
router.post('/:id/proof', protect, authorize('valet'), upload.array('images', 3), async (req: AuthRequest, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    
    const imagePaths = (req.files as Express.Multer.File[])?.map(file => `/uploads/${file.filename}`);
    
    const updateData: any = {
      parkingProof: {
        images: imagePaths || [],
        timestamp: new Date(),
        coordinates: req.body.coordinates ? JSON.parse(req.body.coordinates) : undefined
      }
    };
    if(req.body.parkingSlot) {
      updateData.parkingSlot = req.body.parkingSlot;
    }
    
    const updatedSession = await Session.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedSession);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
