const express = require('express');
const { getStats, getFeed, getCharts } = require('../controllers/dashboardController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.use(protect); // All dashboard routes are protected

router.get('/stats', getStats);
router.get('/feed', getFeed);
router.get('/charts', getCharts);

module.exports = router;
