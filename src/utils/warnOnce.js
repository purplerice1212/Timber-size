const warned = new Set();

/**
 * Emit a console warning once per unique message.
 *
 * @param {string} message
 */
export function warnOnce(message) {
  if (warned.has(message)) return;
  warned.add(message);
  if (typeof console !== 'undefined' && typeof console.warn === 'function') {
    console.warn(message);
  }
}

/**
 * Test helper to reset the warning cache.
 */
export function __resetWarnOnce() {
  warned.clear();
}
