const express = require('express');
const { scanUrl, scanMessage, scanScreenshot } = require('../controllers/scanController');
const upload = require('../middlewares/upload');
// const { protect } = require('../middlewares/auth'); // Optional protect

const router = express.Router();

// Allow scanning without auth for now (or wrap with protect to enforce login)
router.post('/url', scanUrl);
router.post('/message', scanMessage);
router.post('/screenshot', upload.single('image'), scanScreenshot);

module.exports = router;
