const express = require('express');
const {
  getEvents, getEventById, getMyEvents, createEvent, updateEvent, deleteEvent,
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getEvents);
router.get('/mine/list', protect, authorize('organizer', 'admin'), getMyEvents);
router.get('/:id', getEventById);
router.post('/', protect, authorize('organizer', 'admin'), createEvent);
router.put('/:id', protect, authorize('organizer', 'admin'), updateEvent);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteEvent);

module.exports = router;
