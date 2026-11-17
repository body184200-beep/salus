import { db } from '../db/database.js';
export function logAudit(action, resourceType, getResourceId, getDetails) {
    return (req, res, next) => {
        // Intercept finish to record status
        res.on('finish', () => {
            try {
                if (res.statusCode < 400) {
                    const userId = req.user ? req.user.id : null;
                    const resourceId = getResourceId ? getResourceId(req) : req.params.id || null;
                    const details = getDetails ? getDetails(req, res) : `${req.method} ${req.originalUrl} (${res.statusCode})`;
                    const ip = req.ip || req.socket.remoteAddress || 'unknown';
                    const auditId = 'aud-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);
                    db.prepare(`
            INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, ip_address, details, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run(auditId, userId, action, resourceType, resourceId, ip, details, new Date().toISOString());
                }
            }
            catch (err) {
                console.error('Audit log error:', err);
            }
        });
        next();
    };
}
export function directAuditLog(userId, action, resourceType, resourceId, details, ip = '127.0.0.1') {
    try {
        const auditId = 'aud-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);
        db.prepare(`
      INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, ip_address, details, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(auditId, userId, action, resourceType, resourceId, ip, details, new Date().toISOString());
    }
    catch (err) {
        console.error('Direct audit log failed:', err);
    }
}
