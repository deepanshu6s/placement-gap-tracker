const { spawnSync } = require('child_process');
const path = require('path');
const jwt = require('jsonwebtoken');

const envPath = path.resolve(__dirname, '../../src/config/env.js');

/**
 * Helper to run env.js in an isolated Node child process with a controlled environment.
 * Ensures no test-runner env caching or module-level caching affects validation tests.
 */
function runEnvInChildProcess(envOverrides) {
  // Pass base OS essentials (PATH, SystemRoot) while isolating application env vars
  const cleanEnv = {
    PATH: process.env.PATH || '',
    SystemRoot: process.env.SystemRoot || '',
    NODE_ENV: 'test',
    PORT: '5000',
    DB_HOST: 'localhost',
    DB_PORT: '5432',
    DB_NAME: 'placement_tracker',
    DB_USER: 'postgres',
    DB_PASSWORD: 'postgres_password_dev',
    FRONTEND_URL: 'http://localhost:5173',
    ...envOverrides,
  };

  const result = spawnSync(process.execPath, [
    '-e',
    `require(${JSON.stringify(envPath)})`
  ], {
    env: cleanEnv,
    encoding: 'utf8',
    timeout: 5000,
  });

  return {
    status: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
  };
}

describe('Authentication Environment Configuration & Secret Security (Task 02)', () => {
  const VALID_JWT_SECRET = 'valid-production-grade-jwt-secret-key-min-32-chars!';
  const VALID_REFRESH_SECRET = 'valid-production-grade-refresh-token-secret-32ch!';

  describe('1. Valid Explicit Configuration', () => {
    it('accepts explicitly configured secrets exceeding 32 characters', () => {
      const res = runEnvInChildProcess({
        JWT_SECRET: VALID_JWT_SECRET,
        REFRESH_TOKEN_SECRET: VALID_REFRESH_SECRET,
      });

      expect(res.status).toBe(0);
      expect(res.stderr).not.toContain('Critical Environment Validation Error');
    });
  });

  describe('2. Missing Required Secrets', () => {
    it('fails configuration validation when JWT_SECRET is missing', () => {
      const res = runEnvInChildProcess({
        REFRESH_TOKEN_SECRET: VALID_REFRESH_SECRET,
      });

      expect(res.status).toBe(1);
      expect(res.stderr).toContain('Critical Environment Validation Error');
      expect(res.stderr).toContain('JWT_SECRET is required');
    });

    it('fails configuration validation when REFRESH_TOKEN_SECRET is missing', () => {
      const res = runEnvInChildProcess({
        JWT_SECRET: VALID_JWT_SECRET,
      });

      expect(res.status).toBe(1);
      expect(res.stderr).toContain('Critical Environment Validation Error');
      expect(res.stderr).toContain('REFRESH_TOKEN_SECRET is required');
    });

    it('fails configuration validation when both secrets are missing', () => {
      const res = runEnvInChildProcess({});

      expect(res.status).toBe(1);
      expect(res.stderr).toContain('Critical Environment Validation Error');
      expect(res.stderr).toContain('JWT_SECRET is required');
      expect(res.stderr).toContain('REFRESH_TOKEN_SECRET is required');
    });
  });

  describe('3. Empty and Whitespace-Only Secrets', () => {
    it('rejects empty string JWT_SECRET', () => {
      const res = runEnvInChildProcess({
        JWT_SECRET: '',
        REFRESH_TOKEN_SECRET: VALID_REFRESH_SECRET,
      });

      expect(res.status).toBe(1);
      expect(res.stderr).toContain('JWT_SECRET cannot be empty or whitespace only');
    });

    it('rejects whitespace-only JWT_SECRET', () => {
      const res = runEnvInChildProcess({
        JWT_SECRET: '      ',
        REFRESH_TOKEN_SECRET: VALID_REFRESH_SECRET,
      });

      expect(res.status).toBe(1);
      expect(res.stderr).toContain('JWT_SECRET cannot be empty or whitespace only');
    });

    it('rejects empty string REFRESH_TOKEN_SECRET', () => {
      const res = runEnvInChildProcess({
        JWT_SECRET: VALID_JWT_SECRET,
        REFRESH_TOKEN_SECRET: '',
      });

      expect(res.status).toBe(1);
      expect(res.stderr).toContain('REFRESH_TOKEN_SECRET cannot be empty or whitespace only');
    });

    it('rejects whitespace-only REFRESH_TOKEN_SECRET', () => {
      const res = runEnvInChildProcess({
        JWT_SECRET: VALID_JWT_SECRET,
        REFRESH_TOKEN_SECRET: '   \t  \n ',
      });

      expect(res.status).toBe(1);
      expect(res.stderr).toContain('REFRESH_TOKEN_SECRET cannot be empty or whitespace only');
    });
  });

  describe('4. Inadequate Secret Length (Sub-32 Characters)', () => {
    it('rejects JWT_SECRET shorter than 32 characters', () => {
      const res = runEnvInChildProcess({
        JWT_SECRET: 'short-secret-only-18-chars',
        REFRESH_TOKEN_SECRET: VALID_REFRESH_SECRET,
      });

      expect(res.status).toBe(1);
      expect(res.stderr).toContain('JWT_SECRET must be at least 32 characters long');
    });

    it('rejects REFRESH_TOKEN_SECRET shorter than 32 characters', () => {
      const res = runEnvInChildProcess({
        JWT_SECRET: VALID_JWT_SECRET,
        REFRESH_TOKEN_SECRET: 'short-refresh-secret',
      });

      expect(res.status).toBe(1);
      expect(res.stderr).toContain('REFRESH_TOKEN_SECRET must be at least 32 characters long');
    });
  });

  describe('5. Secret Value Non-Leakage in Error Outputs', () => {
    it('does not print the attempted secret value in error logs or stderr when validation fails', () => {
      const attemptedCandidateSecret = 'leaked-attempted-short-secret';
      const res = runEnvInChildProcess({
        JWT_SECRET: attemptedCandidateSecret,
        REFRESH_TOKEN_SECRET: VALID_REFRESH_SECRET,
      });

      expect(res.status).toBe(1);
      // The secret value itself must NEVER appear in the error output
      expect(res.stderr).not.toContain(attemptedCandidateSecret);
      expect(res.stdout).not.toContain(attemptedCandidateSecret);
      expect(res.stderr).toContain('JWT_SECRET must be at least 32 characters long');
    });
  });

  describe('6. Token Issuance and Verification Integrity', () => {
    it('signs and verifies JWT access tokens correctly with validated secret', () => {
      const env = require('../../src/config/env');
      const payload = { userId: '11111111-2222-3333-4444-555555555555', role: 'student' };

      const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '15m' });
      const decoded = jwt.verify(token, env.JWT_SECRET);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.role).toBe(payload.role);
    });

    it('fails verification if token was signed with an untrusted or mismatched key', () => {
      const env = require('../../src/config/env');
      const payload = { userId: '11111111-2222-3333-4444-555555555555', role: 'student' };

      const attackerToken = jwt.sign(payload, 'attacker-controlled-key-32-chars-long!!', { expiresIn: '15m' });

      expect(() => {
        jwt.verify(attackerToken, env.JWT_SECRET);
      }).toThrow();
    });
  });

  describe('7. Docker Compose & Environment Template Integrity (Task 03)', () => {
    const fs = require('fs');

    it('ensures docker-compose.yml passes JWT_SECRET and REFRESH_TOKEN_SECRET without hardcoded values', () => {
      const composePath = path.resolve(__dirname, '../../../docker-compose.yml');
      expect(fs.existsSync(composePath)).toBe(true);

      const composeContent = fs.readFileSync(composePath, 'utf8');

      // Verify variables are mapped via environment interpolation
      expect(composeContent).toMatch(/JWT_SECRET:\s*\$\{JWT_SECRET\}/);
      expect(composeContent).toMatch(/REFRESH_TOKEN_SECRET:\s*\$\{REFRESH_TOKEN_SECRET\}/);

      // Verify no hardcoded secrets exist in docker-compose.yml
      expect(composeContent).not.toContain('dev-jwt-secret');
      expect(composeContent).not.toContain('dev-refresh-secret');
    });

    it('ensures root .env.example documents required JWT and refresh token configuration', () => {
      const rootEnvExamplePath = path.resolve(__dirname, '../../../.env.example');
      expect(fs.existsSync(rootEnvExamplePath)).toBe(true);

      const rootEnvContent = fs.readFileSync(rootEnvExamplePath, 'utf8');
      expect(rootEnvContent).toContain('JWT_SECRET=');
      expect(rootEnvContent).toContain('REFRESH_TOKEN_SECRET=');
      expect(rootEnvContent).toContain('REQUIRED');
    });

    it('ensures backend/.env.example documents required JWT and refresh token configuration', () => {
      const backendEnvExamplePath = path.resolve(__dirname, '../../.env.example');
      expect(fs.existsSync(backendEnvExamplePath)).toBe(true);

      const backendEnvContent = fs.readFileSync(backendEnvExamplePath, 'utf8');
      expect(backendEnvContent).toContain('JWT_SECRET=');
      expect(backendEnvContent).toContain('REFRESH_TOKEN_SECRET=');
      expect(backendEnvContent).toContain('REQUIRED');
    });
  });
});
