import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  type: { type: String, enum: ['geofence', 'speed', 'anomaly'], required: true },
  message: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  resolved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const Alert = mongoose.model('Alert', alertSchema);
