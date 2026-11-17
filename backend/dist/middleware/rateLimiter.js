const windowMs = 15 * 60 * 1000; // 15 minutes
const maxRequests = 150; // max 150 requests per window
const store = new Map();
export function rateLimiter(req, res, next) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const record = store.get(ip);
    if (!record || now > record.resetTime) {
        store.set(ip, { count: 1, resetTime: now + windowMs });
        return next();
    }
    record.count += 1;
    if (record.count > maxRequests) {
        return res.status(429).json({
            error: 'Too many requests. Please slow down and try again later.',
            errorAr: 'عدد طلبات زائد عن الحد المسموح به. يرجى الانتظار قليلاً ثم إعادة المحاولة.',
            retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000),
        });
    }
    next();
}
