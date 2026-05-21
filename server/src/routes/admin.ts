import express from 'express';
import { protect, authorize } from '../middleware/auth';
import { Session } from '../models/Session';
import { Alert } from '../models/Alert';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/analytics', async (req, res) => {
  try {
    const totalSessions = await Session.countDocuments();
    const activeSessions = await Session.countDocuments({ status: { $nin: ['returned'] } });
    const totalAlerts = await Alert.countDocuments();

    res.json({
      totalSessions,
      activeSessions,
      totalAlerts
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/alerts', async (req, res) => {
  try {
    const alerts = await Alert.find().populate('session').sort('-createdAt');
    res.json(alerts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
