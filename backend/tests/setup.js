// ==============================================================================
// Jest Test Environment Setup
// ==============================================================================
// Supplies explicit test-only secrets to the environment during automated test runs.
// This ensures test execution never relies on production defaults or modifies user
// local configuration, while enforcing strict configuration validation in production.

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-jwt-secret-key-min-32-characters-for-jest-runs-only!!';
}

if (!process.env.REFRESH_TOKEN_SECRET) {
  process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret-key-min-32-characters-for-jest-only!!';
}
