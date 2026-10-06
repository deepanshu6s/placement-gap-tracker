/**
 * Application Logging Utility
 * Standardized logging format for application events
 */

const info = (message, meta = {}) => {
  console.log(
    `[INFO] ${new Date().toISOString()} - ${message}`,
    Object.keys(meta).length ? meta : ''
  );
};

const warn = (message, meta = {}) => {
  console.warn(
    `[WARN] ${new Date().toISOString()} - ${message}`,
    Object.keys(meta).length ? meta : ''
  );
};

const error = (message, err = null) => {
  console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, err ? err.stack || err : '');
};

module.exports = {
  info,
  warn,
  error,
};
