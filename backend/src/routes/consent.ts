import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { directAuditLog } from '../middleware/audit.js';

export const consentRouter = Router();

// POST /api/consent/invite - generate secure invitation code
consentRouter.post('/invite', authenticateToken, (req: Request, res: Response) => {
  const patientId = req.user!.id;
  const { scope = 'all_symptoms', allowedSymptomIds = [], validityDays = 7, notes } = req.body;

  // Generate cryptographic secure alphanumeric invitation code, e.g. SALUS-8F2A-4B1C
  const rawHex = crypto.randomBytes(4).toString('hex').toUpperCase();
  const rawHex2 = crypto.randomBytes(4).toString('hex').toUpperCase();
  const invitationCode = `SALUS-${rawHex}-${rawHex2}`;

  const consentId = 'cst-' + Date.now();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + validityDays * 24 * 60 * 60 * 1000).toISOString();

  db.prepare(`
    INSERT INTO consent_grants (
      id, patient_id, pharmacist_id, invitation_code, scope, allowed_symptom_ids, is_revoked, revoked_at, expires_at, created_at
    ) VALUES (?, ?, null, ?, ?, ?, 0, null, ?, ?)
  `).run(
    consentId,
    patientId,
    invitationCode,
    scope,
    allowedSymptomIds ? JSON.stringify(allowedSymptomIds) : null,
    expiresAt,
    now.toISOString()
  );

  // Create pending follow_up_request linked to this consent
  const requestId = 'req-' + Date.now();
  db.prepare(`
    INSERT INTO follow_up_requests (
      id, patient_id, pharmacist_id, consent_grant_id, status, patient_notes, pharmacist_notes, created_at, updated_at
    ) VALUES (?, ?, null, ?, 'pending', ?, null, ?, ?)
  `).run(requestId, patientId, consentId, notes || null, now.toISOString(), now.toISOString());

  directAuditLog(patientId, 'CONSENT_INVITE_GENERATED', 'consent_grants', consentId, `Generated invite code ${invitationCode} valid until ${expiresAt}`);

  res.status(201).json({
    message: 'Consent invitation generated successfully',
    messageAr: 'تم إنشاء كود مشاركة البيانات مع الصيدلي بنجاح',
    invitationCode,
    expiresAt,
    scope,
    instructionsEn: 'Provide this secure invitation code to your licensed pharmacist. They will enter it in their SALUS professional dashboard to access your authorized symptom logs.',
    instructionsAr: 'أعطِ هذا الكود السري للصيدلي الخاص بك ليقوم بإدخاله في لوحة تحكم الصيدلي للاطلاع على الأعراض المصرح بها ومتابعة حالتك.',
  });
});

// GET /api/consent/my-grants - patient views active & historical grants
consentRouter.get('/my-grants', authenticateToken, (req: Request, res: Response) => {
  const patientId = req.user!.id;

  const grants = db.prepare(`
    SELECT c.*, 
           p.display_name as pharmacist_name,
           prof.workplace as pharmacist_workplace,
           prof.license_number as pharmacist_license
    FROM consent_grants c
    LEFT JOIN users p ON c.pharmacist_id = p.id
    LEFT JOIN pharmacist_profiles prof ON p.id = prof.user_id
    WHERE c.patient_id = ?
    ORDER BY c.created_at DESC
  `).all(patientId) as any[];

  res.json({
    grants: grants.map((g) => ({
      ...g,
      is_revoked: g.is_revoked === 1,
      isExpired: new Date(g.expires_at) < new Date(),
    })),
  });
});

// POST /api/consent/revoke/:id - patient revokes consent
consentRouter.post('/revoke/:id', authenticateToken, (req: Request, res: Response) => {
  const patientId = req.user!.id;
  const grantId = req.params.id as string;

  const grant = db.prepare('SELECT id, invitation_code FROM consent_grants WHERE id = ? AND patient_id = ?').get(grantId, patientId) as any;
  if (!grant) {
    return res.status(404).json({ error: 'Consent grant not found or unauthorized' });
  }

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE consent_grants
    SET is_revoked = 1, revoked_at = ?
    WHERE id = ?
  `).run(now, grantId);

  // Update follow_up_requests
  db.prepare(`
    UPDATE follow_up_requests
    SET status = 'cancelled', updated_at = ?
    WHERE consent_grant_id = ? AND status IN ('pending', 'in_review')
  `).run(now, grantId);

  directAuditLog(patientId, 'CONSENT_REVOKED', 'consent_grants', grantId, `Revoked access code ${grant.invitation_code}`);

  res.json({
    message: 'Access consent revoked. Pharmacists can no longer view these health records.',
    messageAr: 'تم إلغاء صلاحية الوصول بنجاح. لن يتمكن الصيدلي من الاطلاع على أي من هذه السجلات بعد الآن.',
  });
});
