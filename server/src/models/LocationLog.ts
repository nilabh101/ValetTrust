import mongoose from 'mongoose';

const locationLogSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  valet: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  speed: { type: Number },
  timestamp: { type: Date, default: Date.now }
});

export const LocationLog = mongoose.model('LocationLog', locationLogSchema);
