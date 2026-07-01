const { google } = require('googleapis');
const db = require('../../db');

class CalendarService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  getAuthUrl(userId) {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: scopes,
      state: userId,
    });
  }

  async handleCallback(code, userId) {
    const { tokens } = await this.oauth2Client.getToken(code);
    
    if (tokens.refresh_token) {
      await this.saveRefreshToken(userId, tokens.refresh_token);
    }
    
    return tokens;
  }

  async saveRefreshToken(userId, refreshToken) {
    const query = `
      INSERT INTO user_oauth_tokens (user_id, refresh_token)
      VALUES ($1, $2)
      ON CONFLICT (user_id) 
      DO UPDATE SET refresh_token = EXCLUDED.refresh_token, updated_at = CURRENT_TIMESTAMP
    `;
    await db.query(query, [userId, refreshToken]);
  }

  async getRefreshToken(userId) {
    const result = await db.query('SELECT refresh_token FROM user_oauth_tokens WHERE user_id = $1', [userId]);
    if (result.rowCount === 0) {
      return null;
    }
    return result.rows[0].refresh_token;
  }
}

module.exports = new CalendarService();
