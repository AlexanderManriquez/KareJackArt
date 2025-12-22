// Simple in-memory rate limiter for auth endpoints
const attempts = new Map(); // ip -> {count, firstTs}
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_ATTEMPTS = 6;

function rateLimiter(req, res, next) {
  try {
    const key = req.ip || req.connection.remoteAddress || 'global';
    const now = Date.now();
    const entry = attempts.get(key) || { count: 0, firstTs: now };
    if (now - entry.firstTs > WINDOW_MS) {
      entry.count = 0;
      entry.firstTs = now;
    }
    entry.count++;
    attempts.set(key, entry);
    if (entry.count > MAX_ATTEMPTS) {
      res.status(429).json({ error: 'Demasiados intentos. Intenta nuevamente más tarde.' });
      return;
    }
    next();
  } catch (e) {
    next();
  }
}

module.exports = rateLimiter;
