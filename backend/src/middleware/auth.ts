import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { db } from '../db/database.js';

export interface AuthUser {
  id: string;
  email: string;
  role: 'patient' | 'pharmacist' | 'admin';
  displayName: string;
  preferredLanguage: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      error: 'Authentication token required',
      errorAr: 'تسجيل الدخول مطلوب للوصول إلى هذه الخدمة',
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    const user = db.prepare('SELECT id, email, display_name, role, preferred_language FROM users WHERE id = ?').get(decoded.id) as any;

    if (!user) {
      return res.status(401).json({
        error: 'User not found or session expired',
        errorAr: 'المستخدم غير موجود أو انتهت صلاحية الجلسة',
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      displayName: user.display_name,
      preferredLanguage: user.preferred_language,
    };
    next();
  } catch (err) {
    return res.status(403).json({
      error: 'Invalid or expired token',
      errorAr: 'رمز الجلسة غير صالح أو منتهي الصلاحية',
    });
  }
}

export function requireRole(...allowedRoles: Array<'patient' | 'pharmacist' | 'admin'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', errorAr: 'غير مصرح بالدخول' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}`,
        errorAr: 'عذراً، ليس لديك الصلاحية الكافية للوصول إلى هذه الصفحة',
      });
    }

    next();
  };
}

export function requireVerifiedPharmacist(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'pharmacist') {
    return res.status(403).json({
      error: 'Access restricted to licensed pharmacists',
      errorAr: 'هذا القسم مخصص للصيادلة المرخصين فقط',
    });
  }

  const profile = db.prepare('SELECT verification_status FROM pharmacist_profiles WHERE user_id = ?').get(req.user.id) as any;

  if (!profile || profile.verification_status !== 'verified') {
    return res.status(403).json({
      error: 'Pharmacist account verification is pending. Professional privileges will be granted upon syndicate license verification.',
      errorAr: 'حساب الصيدلي قيد المراجعة والتحقق. سيتم منح الصلاحيات المهنية فور التحقق من ترخيص النقابة ومزاولة المهنة.',
      verificationStatus: profile ? profile.verification_status : 'unregistered',
    });
  }

  next();
}
