/**
 * CSV Utilities with RFC 4180 compliance and CSV Formula Injection Protection.
 * 
 * Protection rules:
 * - Legitimate finite numbers (positive or negative, e.g. -5, 12.3) are preserved as numeric literals.
 * - Text cells starting with formula triggers (=, +, -, @, \t, \r) are neutralized by prepending a single quote (').
 * - Dangerous leading whitespace before formula triggers (e.g. "   =1+1") is also neutralized.
 * - Double quotes ("), commas (,), carriage returns (\r), and line feeds (\n) are escaped per RFC 4180.
 */

function sanitizeCSVCell(val, nullFallback = '') {
  if (val === null || val === undefined) {
    return nullFallback;
  }

  // Pure finite number (e.g. -5, 42, 0, -3.14): numbers cannot execute formulas
  if (typeof val === 'number') {
    return Number.isFinite(val) ? String(val) : nullFallback;
  }

  if (typeof val === 'boolean') {
    return val ? 'true' : 'false';
  }

  const raw = String(val);
  const trimmed = raw.trim();

  // If the trimmed string is a legitimate negative or positive number (e.g. "-5", "-12.5", "42")
  // Do NOT prepend a quote; preserve it as a legitimate numeric representation
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return trimmed;
  }

  let safe = raw;

  // Check if string starts with formula triggers (=, +, -, @, \t, \r)
  // or has leading whitespace followed by a formula trigger
  if (/^[\s\t\r]*[=+@-]/.test(raw) || /^[\t\r]/.test(raw)) {
    safe = `'${raw}`;
  }

  // RFC 4180 escaping: if it contains quotes, commas, \r, or \n, wrap in quotes and escape internal quotes
  if (safe.includes('"') || safe.includes(',') || safe.includes('\n') || safe.includes('\r')) {
    return `"${safe.replace(/"/g, '""')}"`;
  }

  return safe;
}

function formatCSVRow(cells, nullFallback = '') {
  return cells.map(c => sanitizeCSVCell(c, nullFallback)).join(',');
}

module.exports = {
  sanitizeCSVCell,
  formatCSVRow,
};
