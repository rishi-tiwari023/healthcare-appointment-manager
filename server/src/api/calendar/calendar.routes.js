const express = require('express');
const router = express.Router();
const calendarController = require('./calendar.controller');

// Generate Auth URL
router.get('/auth', calendarController.getAuthUrl);

// OAuth Callback
router.get('/callback', calendarController.handleCallback.bind(calendarController));

module.exports = router;
