const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const UserRepository = require('../repositories/user.repository');
const env = require('../config/env');

const AuthService = {
  async register(email, password) {
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email is already registered');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await UserRepository.create({
      email,
      password_hash: passwordHash,
      role: 'student', // Enforced by design
    });

    return { id: user.id, email: user.email, role: user.role };
  },

  async login(email, password) {
    const user = await UserRepository.findByEmail(email);
    if (!user || !user.is_active) {
      throw new Error('Invalid credentials or inactive account');
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials or inactive account');
    }

    const { accessToken, refreshToken, refreshTokenHash, expiresAt } = this.generateTokens(user);

    await UserRepository.createRefreshToken({
      user_id: user.id,
      token_hash: refreshTokenHash,
      expires_at: expiresAt,
    });

    return {
      user: { id: user.id, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    };
  },

  async refresh(refreshToken) {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const dbToken = await UserRepository.findRefreshToken(tokenHash);

    if (!dbToken || dbToken.revoked || new Date() > dbToken.expires_at || !dbToken.is_active) {
      throw new Error('Invalid or expired refresh token');
    }

    try {
      jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      throw new Error('Invalid or expired refresh token');
    }

    // Revoke old token
    await UserRepository.revokeRefreshToken(tokenHash);

    // Generate new tokens
    const user = { id: dbToken.user_id, email: dbToken.email, role: dbToken.role };
    const { accessToken, refreshToken: newRefreshToken, refreshTokenHash, expiresAt } = this.generateTokens(user);

    await UserRepository.createRefreshToken({
      user_id: user.id,
      token_hash: refreshTokenHash,
      expires_at: expiresAt,
    });

    return { accessToken, refreshToken: newRefreshToken };
  },

  async logout(refreshToken, userId) {
    if (refreshToken) {
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await UserRepository.revokeRefreshToken(tokenHash);
    } else if (userId) {
      await UserRepository.revokeAllUserRefreshTokens(userId);
    }
  },

  generateTokens(user) {
    const payload = { userId: user.id, email: user.email, role: user.role };
    
    const accessToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
    const refreshToken = jwt.sign(payload, env.REFRESH_TOKEN_SECRET, { expiresIn: `${env.REFRESH_TOKEN_EXPIRES_DAYS}d` });
    
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

    return { accessToken, refreshToken, refreshTokenHash, expiresAt };
  }
};

module.exports = AuthService;
