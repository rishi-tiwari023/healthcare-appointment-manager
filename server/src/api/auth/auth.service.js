const bcrypt = require('bcrypt');
const db = require('../../db');
const { signAccessToken, signRefreshToken } = require('../../common/utils/jwt');

class AuthService {
  async registerPatient(data) {
    const { email, password, first_name, last_name, date_of_birth, phone_number } = data;

    // 1. Check if user exists
    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rowCount > 0) {
      throw { statusCode: 409, message: 'User with this email already exists' };
    }

    // 2. Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // 3. Create user
      const userResult = await client.query(
        'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
        [email, passwordHash, 'patient']
      );
      const user = userResult.rows[0];

      // 4. Create patient profile
      await client.query(
        'INSERT INTO patients (user_id, first_name, last_name, date_of_birth, phone_number) VALUES ($1, $2, $3, $4, $5)',
        [user.id, first_name, last_name, date_of_birth, phone_number]
      );

      await client.query('COMMIT');

      // 5. Generate tokens
      const accessToken = signAccessToken({ id: user.id, role: user.role });
      const refreshToken = signRefreshToken({ id: user.id, role: user.role });

      return { user, accessToken, refreshToken };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async login(email, password) {
    const userResult = await db.query('SELECT id, email, password_hash, role FROM users WHERE email = $1', [email]);
    if (userResult.rowCount === 0) {
      throw { statusCode: 401, message: 'Invalid credentials' };
    }

    const user = userResult.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      throw { statusCode: 401, message: 'Invalid credentials' };
    }

    const accessToken = signAccessToken({ id: user.id, role: user.role });
    const refreshToken = signRefreshToken({ id: user.id, role: user.role });

    delete user.password_hash;
    return { user, accessToken, refreshToken };
  }
}

module.exports = new AuthService();
