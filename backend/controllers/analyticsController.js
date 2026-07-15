const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Event = require('../models/Event');

const assertOwnsEvent = async (eventId, user) => {
  const event = await Event.findById(eventId);
  if (!event) {
    const err = new Error('Event not found');
    err.status = 404;
    throw err;
  }
  if (event.organizer.toString() !== user._id.toString() && user.role !== 'admin') {
    const err = new Error('Not authorized to view analytics for this event');
    err.status = 403;
    throw err;
  }
  return event;
};

// GET /api/analytics/event/:eventId/summary
const getEventSummary = asyncHandler(async (req, res) => {
  const event = await assertOwnsEvent(req.params.eventId, req.user);

  const [revenueAgg] = await Booking.aggregate([
    { $match: { event: event._id, paymentStatus: 'paid' } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
        ticketsSold: { $sum: '$quantity' },
        totalBookings: { $sum: 1 },
      },
    },
  ]);

  const checkedIn = await Booking.countDocuments({
    event: event._id,
    paymentStatus: 'paid',
    checkedIn: true,
  });

  res.json({
    eventTitle: event.title,
    totalRevenue: revenueAgg?.totalRevenue || 0,
    ticketsSold: revenueAgg?.ticketsSold || 0,
    totalBookings: revenueAgg?.totalBookings || 0,
    capacity: event.ticketTiers.reduce((s, t) => s + t.quantityTotal, 0),
    checkedIn,
  });
});

// GET /api/analytics/event/:eventId/sales-over-time?interval=day
const getSalesOverTime = asyncHandler(async (req, res) => {
  const event = await assertOwnsEvent(req.params.eventId, req.user);
  const dateFormat = req.query.interval === 'hour' ? '%Y-%m-%dT%H:00' : '%Y-%m-%d';

  const data = await Booking.aggregate([
    { $match: { event: event._id, paymentStatus: 'paid' } },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
        revenue: { $sum: '$totalAmount' },
        ticketsSold: { $sum: '$quantity' },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: '$_id', revenue: 1, ticketsSold: 1 } },
  ]);

  res.json(data);
});

// GET /api/analytics/event/:eventId/revenue-by-tier
const getRevenueByTier = asyncHandler(async (req, res) => {
  const event = await assertOwnsEvent(req.params.eventId, req.user);

  const data = await Booking.aggregate([
    { $match: { event: event._id, paymentStatus: 'paid' } },
    {
      $group: {
        _id: '$tierName',
        revenue: { $sum: '$totalAmount' },
        ticketsSold: { $sum: '$quantity' },
      },
    },
    { $project: { _id: 0, tierName: '$_id', revenue: 1, ticketsSold: 1 } },
    { $sort: { revenue: -1 } },
  ]);

  res.json(data);
});

// GET /api/analytics/organizer/overview  (across all of an organizer's events)
const getOrganizerOverview = asyncHandler(async (req, res) => {
  const events = await Event.find({ organizer: req.user._id }).select('_id title');
  const eventIds = events.map((e) => e._id);

  const perEvent = await Booking.aggregate([
    { $match: { event: { $in: eventIds }, paymentStatus: 'paid' } },
    {
      $group: {
        _id: '$event',
        revenue: { $sum: '$totalAmount' },
        ticketsSold: { $sum: '$quantity' },
      },
    },
  ]);

  const revenueMap = new Map(perEvent.map((p) => [p._id.toString(), p]));

  const results = events.map((e) => ({
    eventId: e._id,
    title: e.title,
    revenue: revenueMap.get(e._id.toString())?.revenue || 0,
    ticketsSold: revenueMap.get(e._id.toString())?.ticketsSold || 0,
  }));

  res.json({
    totalRevenue: results.reduce((s, r) => s + r.revenue, 0),
    totalTicketsSold: results.reduce((s, r) => s + r.ticketsSold, 0),
    events: results,
  });
});

module.exports = { getEventSummary, getSalesOverTime, getRevenueByTier, getOrganizerOverview };
