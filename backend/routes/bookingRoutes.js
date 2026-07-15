const express = require('express');
const {
  createBooking, getMyBookings, getBookingById,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/checkout', protect, createBooking);
router.get('/mine', protect, getMyBookings);
router.get('/:id', protect, getBookingById);

module.exports = router;
