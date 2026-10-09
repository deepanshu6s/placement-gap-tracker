const { query, pool } = require('../config/db');

const UserRepository = {
  async findByEmail(email) {
    const result = await query(
      'SELECT id, email, password_hash, role, is_active, created_at, updated_at FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  },

  async findById(id) {
    const result = await query(
      'SELECT id, email, role, is_active, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  async create({ email, password_hash, role = 'student' }) {
    const result = await query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, $3)
       RETURNING id, email, role, is_active, created_at, updated_at`,
      [email, password_hash, role]
    );
    return result.rows[0];
  },

  // Refresh token operations
  async createRefreshToken({ user_id, token_hash, expires_at }) {
    const result = await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, expires_at, revoked, created_at`,
      [user_id, token_hash, expires_at]
    );
    return result.rows[0];
  },

  async findRefreshToken(token_hash) {
    const result = await query(
      `SELECT rt.id, rt.user_id, rt.token_hash, rt.expires_at, rt.revoked, rt.created_at,
              u.email, u.role, u.is_active
       FROM refresh_tokens rt
       JOIN users u ON rt.user_id = u.id
       WHERE rt.token_hash = $1`,
      [token_hash]
    );
    return result.rows[0] || null;
  },

  async revokeRefreshToken(token_hash) {
    await query(
      'UPDATE refresh_tokens SET revoked = true WHERE token_hash = $1',
      [token_hash]
    );
  },

  async revokeAllUserRefreshTokens(user_id) {
    await query(
      'UPDATE refresh_tokens SET revoked = true WHERE user_id = $1',
      [user_id]
    );
  },

  async deleteExpiredRefreshTokens() {
    await query(
      'DELETE FROM refresh_tokens WHERE expires_at < NOW() OR revoked = true'
    );
  },
};

module.exports = UserRepository;
