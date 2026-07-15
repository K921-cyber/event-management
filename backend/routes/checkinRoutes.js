const express = require('express');
const { scanCheckIn, getCheckInStats } = require('../controllers/checkinController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/scan', protect, authorize('organizer', 'admin'), scanCheckIn);
router.get('/event/:eventId/stats', protect, authorize('organizer', 'admin'), getCheckInStats);

module.exports = router;
