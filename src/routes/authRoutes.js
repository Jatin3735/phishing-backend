const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, generateApiKey } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');

const router = express.Router();

router.post('/register', [
  body('name', 'Name is required').not().isEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], validate, register);

router.post('/login', [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists()
], validate, login);

router.get('/me', protect, getMe);

router.post('/api-key', protect, [
    body('name', 'API Key name should be a string').optional().isString()
], validate, generateApiKey);

module.exports = router;
