const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');

// GET /api/events  (public, supports ?search=&category=&city=&status=live)
const getEvents = asyncHandler(async (req, res) => {
  const { search, category, city, status } = req.query;
  const filter = {};

  if (status) filter.status = status;
  else filter.status = { $in: ['live', 'sold_out'] }; // default: only show public-facing events

  if (category) filter.category = category;
  if (city) filter['venue.city'] = new RegExp(city, 'i');
  if (search) filter.$text = { $search: search };

  const events = await Event.find(filter).populate('organizer', 'name email').sort({ startDate: 1 });
  res.json(events);
});

// GET /api/events/:id
const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('organizer', 'name email');
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  res.json(event);
});

// GET /api/events/mine/list  (organizer's own events)
const getMyEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ organizer: req.user._id }).sort({ createdAt: -1 });
  res.json(events);
});

// POST /api/events  (organizer only)
const createEvent = asyncHandler(async (req, res) => {
  const { title, description, coverImageUrl, category, venue, startDate, endDate, ticketTiers } = req.body;

  if (!title || !description || !venue || !startDate || !endDate || !ticketTiers?.length) {
    res.status(400);
    throw new Error('Missing required event fields');
  }

  const event = await Event.create({
    title,
    description,
    coverImageUrl,
    category,
    venue,
    startDate,
    endDate,
    ticketTiers,
    organizer: req.user._id,
    status: 'draft',
  });

  // Real-time notify all connected dashboards of a new event
  req.io?.emit('event:created', event);

  res.status(201).json(event);
});

// PUT /api/events/:id  (organizer who owns it, or admin)
const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to edit this event');
  }

  const updatableFields = [
    'title', 'description', 'coverImageUrl', 'category',
    'venue', 'startDate', 'endDate', 'ticketTiers', 'status',
  ];
  updatableFields.forEach((field) => {
    if (req.body[field] !== undefined) event[field] = req.body[field];
  });

  const updated = await event.save();
  req.io?.emit('event:updated', updated);
  res.json(updated);
});

// DELETE /api/events/:id
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this event');
  }
  await event.deleteOne();
  req.io?.emit('event:deleted', { id: req.params.id });
  res.json({ message: 'Event deleted' });
});

module.exports = { getEvents, getEventById, getMyEvents, createEvent, updateEvent, deleteEvent };
