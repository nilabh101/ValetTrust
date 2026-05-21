import { Server, Socket } from 'socket.io';
import { LocationLog } from '../models/LocationLog';
import { Alert } from '../models/Alert';
import { Session } from '../models/Session';

// Center of the geofence
const PARKING_ZONE = { lat: 28.6139, lng: 77.2090 }; 
const MAX_RADIUS_METERS = 500;
const MAX_SPEED_KMH = 30;

function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
  var R = 6371000; 
  var dLat = (lat2-lat1) * (Math.PI/180);
  var dLon = (lon2-lon1) * (Math.PI/180); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c;
  return d;
}

export const setupSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    // Join a room specific to a session to listen for updates
    socket.on('joinSession', (sessionId: string) => {
      socket.join(`session_${sessionId}`);
    });

    // Valet sends location update
    socket.on('updateLocation', async (data: { sessionId: string, lat: number, lng: number, speed: number }) => {
      const { sessionId, lat, lng, speed } = data;
      
      try {
        // Save to DB
        const session = await Session.findById(sessionId);
        if(!session) return;

        await LocationLog.create({
          session: sessionId,
          valet: session.valet,
          coordinates: { lat, lng },
          speed
        });

        // Broadcast to customer and admin
        io.to(`session_${sessionId}`).emit('locationUpdated', data);
        io.to('admin').emit('adminLocationUpdated', data);

        // Geofencing Check
        const distance = getDistanceFromLatLonInM(lat, lng, PARKING_ZONE.lat, PARKING_ZONE.lng);
        if (distance > MAX_RADIUS_METERS) {
          const alert = await Alert.create({
            session: sessionId,
            type: 'geofence',
            message: `Vehicle exited parking zone. Distance: ${Math.round(distance)}m`,
            severity: 'high'
          });
          io.to('admin').emit('newAlert', alert);
          io.to(`session_${sessionId}`).emit('geofenceAlert', alert);
        }

        // Speed check
        if (speed > MAX_SPEED_KMH) {
          const alert = await Alert.create({
            session: sessionId,
            type: 'speed',
            message: `Vehicle exceeded speed limit: ${speed} km/h`,
            severity: 'medium'
          });
          io.to('admin').emit('newAlert', alert);
        }
      } catch(error) {
        console.error("Socket error", error);
      }
    });

    socket.on('joinAdmin', () => {
      socket.join('admin');
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};
