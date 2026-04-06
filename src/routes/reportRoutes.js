const express = require('express');
const { getReports, getReportById, exportReports } = require('../controllers/reportController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.use(protect); // Protected API

router.get('/', getReports);
router.get('/export', exportReports);
router.get('/:id', getReportById);

module.exports = router;
