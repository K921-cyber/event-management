const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const { generateQrDataUrl } = require('../utils/qr');

// POST /api/bookings/checkout
// Creates a booking and instantly confirms it (free booking — no payment required).
// Inventory is reserved during creation and the QR code is generated immediately.
const createBooking = asyncHandler(async (req, res) => {
  const { eventId, ticketTierId, quantity } = req.body;

  if (!eventId || !ticketTierId || !quantity || quantity < 1) {
    res.status(400);
    throw new Error('eventId, ticketTierId and quantity are required');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const event = await Event.findById(eventId).session(session);
    if (!event) throw Object.assign(new Error('Event not found'), { status: 404 });

    const tier = event.ticketTiers.id(ticketTierId);
    if (!tier) throw Object.assign(new Error('Ticket tier not found'), { status: 404 });

    const remaining = tier.quantityTotal - tier.quantitySold;
    if (remaining < quantity) {
      throw Object.assign(new Error(`Only ${remaining} tickets left for ${tier.name}`), { status: 400 });
    }

    // Reserve inventory
    tier.quantitySold += quantity;
    if (event.ticketTiers.every((t) => t.quantitySold >= t.quantityTotal)) {
      event.status = 'sold_out';
    }
    await event.save({ session });

    const totalAmount = tier.price * quantity;

    const [booking] = await Booking.create(
      [
        {
          event: event._id,
          attendee: req.user._id,
          ticketTierId: tier._id,
          tierName: tier.name,
          quantity,
          unitPrice: tier.price,
          totalAmount,
          paymentProvider: 'free',
          paymentStatus: 'paid',
        },
      ],
      { session }
    );

    // Generate QR code immediately since booking is auto-confirmed
    booking.qrCodeDataUrl = await generateQrDataUrl(booking._id, booking.qrSecret);
    await booking.save({ session });

    await session.commitTransaction();
    session.endSession();

    req.io?.to(`event:${event._id}`).emit('booking:paid', { bookingId: booking._id });

    res.status(201).json({
      bookingId: booking._id,
      totalAmount,
      qrCodeDataUrl: booking.qrCodeDataUrl,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(err.status || 500);
    throw new Error(err.message);
  }
});

// GET /api/bookings/mine
const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ attendee: req.user._id })
    .populate('event', 'title startDate venue coverImageUrl')
    .sort({ createdAt: -1 });
  res.json(bookings);
});

// GET /api/bookings/:id
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('event', 'title startDate venue organizer');
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  const isOwner = booking.attendee.toString() === req.user._id.toString();
  const isOrganizer = booking.event.organizer.toString() === req.user._id.toString();
  if (!isOwner && !isOrganizer && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this booking');
  }
  res.json(booking);
});

module.exports = { createBooking, getMyBookings, getBookingById };
