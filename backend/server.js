require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const checkinRoutes = require('./routes/checkinRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || '*', methods: ['GET', 'POST'] },
});

io.on('connection', (socket) => {
  // Organizer dashboards join a room per event to receive live sales/check-in updates
  socket.on('join:event', (eventId) => socket.join(`event:${eventId}`));
});

// Make io available to controllers via req.io
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(morgan('dev'));

app.use(express.json({ limit: '5mb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
