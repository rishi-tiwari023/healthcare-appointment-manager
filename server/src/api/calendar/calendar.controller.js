const calendarService = require('./calendar.service');

class CalendarController {
  getAuthUrl(req, res, next) {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ success: false, error: 'userId is required in query parameters' });
      }

      const url = calendarService.getAuthUrl(userId);
      res.status(200).json({ success: true, data: { url } });
    } catch (error) {
      next(error);
    }
  }

  async handleCallback(req, res, next) {
    try {
      const { code, state } = req.query;
      
      if (!code || !state) {
        return res.status(400).json({ success: false, error: 'Missing code or state (userId) in callback' });
      }

      const userId = state;
      await calendarService.handleCallback(code, userId);

      // Redirect to frontend or send success message
      const frontendUrl = process.env.FRONTEND_URL;
      res.redirect(`${frontendUrl}/dashboard?calendarSync=success`);
    } catch (error) {
      console.error('Calendar OAuth Callback Error:', error);
      const frontendUrl = process.env.FRONTEND_URL;
      res.redirect(`${frontendUrl}/dashboard?calendarSync=failed`);
    }
  }
}

module.exports = new CalendarController();
