import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  valet: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { 
    type: String, 
    enum: ['pending', 'handover', 'in-transit', 'parked', 'returning', 'returned'], 
    default: 'pending' 
  },
  vehicleDetails: {
    make: String,
    model: String,
    plateNumber: String,
    color: String
  },
  parkingProof: {
    images: [String],
    timestamp: Date,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  parkingSlot: String,
  createdAt: { type: Date, default: Date.now },
  parkedAt: Date,
  returnedAt: Date
});

export const Session = mongoose.model('Session', sessionSchema);
