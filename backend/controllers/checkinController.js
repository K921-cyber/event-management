const asyncHandler = require('express-async-handler');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { verifyQrPayload } = require('../utils/qr');

// POST /api/checkin/scan
// Body: { bookingId, payload }  -- payload is the raw string decoded from the QR image
// Only the organizer who owns the event (or an admin) can check attendees in.
const scanCheckIn = asyncHandler(async (req, res) => {
  const { bookingId, payload } = req.body;

  if (!bookingId || !payload) {
    res.status(400);
    throw new Error('bookingId and payload are required');
  }

  const booking = await Booking.findById(bookingId).populate('event', 'organizer title');
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  const isOrganizer = booking.event.organizer.toString() === req.user._id.toString();
  if (!isOrganizer && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to check in attendees for this event');
  }

  if (booking.paymentStatus !== 'paid') {
    return res.status(400).json({ valid: false, reason: 'Ticket was never paid for' });
  }

  const isValid = verifyQrPayload(payload, booking._id, booking.qrSecret);
  if (!isValid) {
    return res.status(400).json({ valid: false, reason: 'QR code signature invalid or forged' });
  }

  if (booking.checkedIn) {
    return res.status(409).json({
      valid: false,
      reason: 'Ticket already used',
      checkedInAt: booking.checkedInAt,
    });
  }

  booking.checkedIn = true;
  booking.checkedInAt = new Date();
  booking.checkedInBy = req.user._id;
  await booking.save();

  req.io?.to(`event:${booking.event._id}`).emit('checkin:success', {
    bookingId: booking._id,
    checkedInAt: booking.checkedInAt,
  });

  res.json({
    valid: true,
    tierName: booking.tierName,
    quantity: booking.quantity,
    checkedInAt: booking.checkedInAt,
  });
});

// GET /api/checkin/event/:eventId/stats  (live attendance count for an organizer's dashboard)
const getCheckInStats = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  const [paidCount, checkedInCount] = await Promise.all([
    Booking.countDocuments({ event: event._id, paymentStatus: 'paid' }),
    Booking.countDocuments({ event: event._id, paymentStatus: 'paid', checkedIn: true }),
  ]);

  res.json({ paidCount, checkedInCount, noShowCount: paidCount - checkedInCount });
});

module.exports = { scanCheckIn, getCheckInStats };
