const express = require('express');
const { getTemplates, startSimulation, trackAction, getResult } = require('../controllers/simulationController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.get('/templates', getTemplates);
router.post('/start', startSimulation);
router.post('/action', trackAction);
router.get('/:id/result', getResult);

module.exports = router;
