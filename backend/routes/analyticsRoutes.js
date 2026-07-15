const express = require('express');
const {
  getEventSummary, getSalesOverTime, getRevenueByTier, getOrganizerOverview,
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/organizer/overview', protect, authorize('organizer', 'admin'), getOrganizerOverview);
router.get('/event/:eventId/summary', protect, authorize('organizer', 'admin'), getEventSummary);
router.get('/event/:eventId/sales-over-time', protect, authorize('organizer', 'admin'), getSalesOverTime);
router.get('/event/:eventId/revenue-by-tier', protect, authorize('organizer', 'admin'), getRevenueByTier);

module.exports = router;
