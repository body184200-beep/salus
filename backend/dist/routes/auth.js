import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db } from '../db/database.js';
import { config } from '../config/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { directAuditLog } from '../middleware/audit.js';
export const authRouter = Router();
const RegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    displayName: z.string().min(2),
    role: z.enum(['patient', 'pharmacist', 'doctor', 'nurse']).default('patient'),
    preferredLanguage: z.enum(['ar', 'en']).default('ar'),
    // Patient fields
    ageRange: z.string().optional(),
    privacyConsent: z.boolean().optional(),
    // Professional / Doctor / Pharmacist / Nurse fields
    licenseNumber: z.string().optional(),
    workplace: z.string().optional(),
    syndicateNumber: z.string().optional(),
    specialty: z.string().optional(),
});
authRouter.post('/register', async (req, res) => {
    try {
        const data = RegisterSchema.parse(req.body);
        if (data.role === 'patient' && !data.privacyConsent) {
            return res.status(400).json({
                error: 'Explicit patient privacy and consent agreement is required.',
                errorAr: 'الموافقة الصريحة على شروط الخصوصية وحماية البيانات مطلوبة للمتابعة.',
            });
        }
        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(data.email);
        if (existing) {
            return res.status(409).json({
                error: 'An account with this email already exists.',
                errorAr: 'يوجد حساب مسجل بالفعل بهذا البريد الإلكتروني.',
            });
        }
        const prefix = data.role === 'patient' ? 'pat-' : (data.role === 'doctor' ? 'doc-' : (data.role === 'nurse' ? 'nur-' : 'phm-'));
        const userId = 'usr-' + prefix + Date.now();
        const passwordHash = await bcrypt.hash(data.password, 10);
        const now = new Date().toISOString();
        db.prepare(`
      INSERT INTO users (id, email, password_hash, display_name, role, preferred_language, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, data.email, passwordHash, data.displayName, data.role, data.preferredLanguage, now, now);
        if (data.role === 'patient') {
            db.prepare(`
        INSERT INTO patient_profiles (user_id, age_range, privacy_consent, consent_date)
        VALUES (?, ?, ?, ?)
      `).run(userId, data.ageRange || null, 1, now);
        }
        else {
            // Doctor accounts and healthcare professionals get verified status immediately so any doctor can use their account right away
            const initialVerification = (data.role === 'doctor' || data.role === 'nurse') ? 'verified' : 'verified';
            const license = data.licenseNumber || (data.role === 'doctor' ? 'EGY-MD-LICENSED' : 'EGY-PH-LICENSED');
            const work = data.workplace || (data.role === 'doctor' ? 'عيادة خاصة / مستشفى' : 'صيدلية معتمدة');
            db.prepare(`
        INSERT INTO pharmacist_profiles (user_id, full_name, license_number, workplace, syndicate_number, verification_status, verified_at, verified_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(userId, data.displayName, license, work, data.syndicateNumber || null, initialVerification, now, 'SYSTEM_AUTO_VERIFIED');
        }
        directAuditLog(userId, 'USER_REGISTERED', 'users', userId, `Registered as ${data.role}`);
        const token = jwt.sign({ id: userId, email: data.email, role: data.role }, config.jwtSecret, {
            expiresIn: '7d',
        });
        res.status(201).json({
            message: 'Registration successful',
            messageAr: 'تم التسجيل بنجاح وتفعيل الحساب فوراً',
            token,
            user: {
                id: userId,
                email: data.email,
                displayName: data.displayName,
                role: data.role,
                preferredLanguage: data.preferredLanguage,
                pharmacistVerificationStatus: data.role === 'patient' ? undefined : 'verified',
            },
        });
    }
    catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.issues?.[0]?.message || 'Validation error' });
        }
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
authRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required',
                errorAr: 'يرجى إدخال البريد الإلكتروني وكلمة المرور',
            });
        }
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) {
            return res.status(401).json({
                error: 'Invalid email or password',
                errorAr: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
            });
        }
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({
                error: 'Invalid email or password',
                errorAr: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
            });
        }
        let verificationStatus = undefined;
        if (user.role === 'pharmacist') {
            const profile = db.prepare('SELECT verification_status FROM pharmacist_profiles WHERE user_id = ?').get(user.id);
            verificationStatus = profile ? profile.verification_status : 'pending';
        }
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwtSecret, {
            expiresIn: '7d',
        });
        directAuditLog(user.id, 'USER_LOGIN', 'users', user.id, 'User logged in successfully');
        res.json({
            message: 'Login successful',
            messageAr: 'تم تسجيل الدخول بنجاح',
            token,
            user: {
                id: user.id,
                email: user.email,
                displayName: user.display_name,
                role: user.role,
                preferredLanguage: user.preferred_language,
                pharmacistVerificationStatus: verificationStatus,
            },
        });
    }
    catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
authRouter.get('/me', authenticateToken, (req, res) => {
    const user = db.prepare('SELECT id, email, display_name, role, preferred_language, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    let extraProfile = null;
    if (user.role === 'patient') {
        extraProfile = db.prepare('SELECT age_range, privacy_consent, consent_date, emergency_contact FROM patient_profiles WHERE user_id = ?').get(user.id);
    }
    else if (user.role === 'pharmacist') {
        extraProfile = db.prepare('SELECT full_name, license_number, workplace, syndicate_number, verification_status, verified_at FROM pharmacist_profiles WHERE user_id = ?').get(user.id);
    }
    res.json({
        user: {
            ...user,
            profile: extraProfile,
        },
    });
});
authRouter.post('/logout', authenticateToken, (req, res) => {
    directAuditLog(req.user.id, 'USER_LOGOUT', 'users', req.user.id, 'User logged out');
    res.json({ message: 'Logged out successfully', messageAr: 'تم تسجيل الخروج بنجاح' });
});
authRouter.post('/delete-account', authenticateToken, (req, res) => {
    const userId = req.user.id;
    directAuditLog(userId, 'USER_ACCOUNT_DELETED', 'users', userId, 'Patient requested permanent account deletion');
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    res.json({
        message: 'Your account and all associated health records have been permanently deleted in accordance with data privacy regulations.',
        messageAr: 'تم حذف حسابك وجميع السجلات الصحية المرتبطة به نهائياً وفقاً للوائح الخصوصية وحماية البيانات.',
    });
});
authRouter.get('/export-data', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const user = db.prepare('SELECT id, email, display_name, role, preferred_language, created_at FROM users WHERE id = ?').get(userId);
    const symptoms = db.prepare('SELECT * FROM symptom_logs WHERE user_id = ?').all(userId);
    const medications = db.prepare('SELECT * FROM patient_medications WHERE user_id = ?').all(userId);
    const consents = db.prepare('SELECT * FROM consent_grants WHERE patient_id = ?').all(userId);
    directAuditLog(userId, 'DATA_EXPORT_REQUESTED', 'users', userId, 'User downloaded personal health records');
    res.json({
        exportedAt: new Date().toISOString(),
        user,
        medications,
        symptoms,
        consents,
        privacyNotice: 'Exported under SALUS Privacy & Patient Data Ownership Protocol.',
    });
});
