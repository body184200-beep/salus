import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticateToken, requireVerifiedPharmacist } from '../middleware/auth.js';
import { directAuditLog } from '../middleware/audit.js';
export const pharmacistRouter = Router();
// Apply auth + verified pharmacist requirement to all pharmacist routes
pharmacistRouter.use(authenticateToken, requireVerifiedPharmacist);
// POST /api/pharmacist/accept-invite - claim patient invitation code
pharmacistRouter.post('/accept-invite', (req, res) => {
    const pharmacistId = req.user.id;
    const { invitationCode } = req.body;
    if (!invitationCode) {
        return res.status(400).json({ error: 'Invitation code is required', errorAr: 'يرجى إدخال كود المريض' });
    }
    const cleanCode = invitationCode.trim().toUpperCase();
    const grant = db.prepare('SELECT * FROM consent_grants WHERE invitation_code = ?').get(cleanCode);
    if (!grant) {
        return res.status(404).json({
            error: 'Invalid invitation code',
            errorAr: 'كود المشاركة غير صحيح أو غير موجود',
        });
    }
    if (grant.is_revoked === 1) {
        return res.status(403).json({
            error: 'This invitation code has been revoked by the patient.',
            errorAr: 'تم إلغاء صلاحية هذا الكود من قِبل المريض.',
        });
    }
    if (new Date(grant.expires_at) < new Date()) {
        return res.status(403).json({
            error: 'This invitation code has expired.',
            errorAr: 'انتهت صلاحية هذا الكود.',
        });
    }
    // Bind grant to this pharmacist
    db.prepare(`
    UPDATE consent_grants
    SET pharmacist_id = ?
    WHERE id = ?
  `).run(pharmacistId, grant.id);
    // Bind follow_up_requests
    db.prepare(`
    UPDATE follow_up_requests
    SET pharmacist_id = ?, status = 'in_review', updated_at = ?
    WHERE consent_grant_id = ?
  `).run(pharmacistId, new Date().toISOString(), grant.id);
    directAuditLog(pharmacistId, 'PHARMACIST_ACCEPTED_INVITE', 'consent_grants', grant.id, `Pharmacist claimed patient invite ${cleanCode}`);
    res.json({
        message: 'Patient connection established successfully under authorized consent.',
        messageAr: 'تم ربط ملف المريض بنجاح بموجب الموافقة المعتمدة.',
        grantId: grant.id,
        patientId: grant.patient_id,
    });
});
// GET /api/pharmacist/patients - list all connected patients & follow-up cases
pharmacistRouter.get('/patients', (req, res) => {
    const pharmacistId = req.user.id;
    const cases = db.prepare(`
    SELECT f.*, 
           u.display_name as patient_name, u.preferred_language,
           c.scope, c.is_revoked, c.expires_at,
           (SELECT COUNT(*) FROM symptom_logs s WHERE s.user_id = f.patient_id) as total_symptoms_count,
           (SELECT COUNT(*) FROM safety_alerts sa WHERE sa.user_id = f.patient_id AND sa.dismissed = 0) as active_alerts_count
    FROM follow_up_requests f
    JOIN users u ON f.patient_id = u.id
    JOIN consent_grants c ON f.consent_grant_id = c.id
    WHERE f.pharmacist_id = ?
    ORDER BY f.created_at DESC
  `).all(pharmacistId);
    res.json({
        cases: cases.map((c) => ({
            ...c,
            is_revoked: c.is_revoked === 1,
            isExpired: new Date(c.expires_at) < new Date(),
        })),
    });
});
// GET /api/pharmacist/patient/:patientId/records - inspect authorized records
pharmacistRouter.get('/patient/:patientId/records', (req, res) => {
    const pharmacistId = req.user.id;
    const patientId = req.params.patientId;
    // Check active consent
    const grant = db.prepare(`
    SELECT * FROM consent_grants
    WHERE patient_id = ? AND pharmacist_id = ? AND is_revoked = 0 AND expires_at > datetime('now')
    ORDER BY created_at DESC LIMIT 1
  `).get(patientId, pharmacistId);
    if (!grant) {
        return res.status(403).json({
            error: 'Access denied: No active, unrevoked consent grant found for this patient.',
            errorAr: 'تم رفض الوصول: لا توجد موافقة نشطة أو تم إلغاؤها من المريض.',
        });
    }
    // Load Patient info
    const patient = db.prepare('SELECT id, display_name, preferred_language, created_at FROM users WHERE id = ?').get(patientId);
    const profile = db.prepare('SELECT age_range, emergency_contact, notes FROM patient_profiles WHERE user_id = ?').get(patientId);
    // Load Medications
    const medications = db.prepare(`
    SELECT pm.*, 
           p.brand_name_en, p.brand_name_ar, p.strength as product_strength, p.formulation,
           a.name_en as active_name_en, a.name_ar as active_name_ar, a.drug_class_en, a.drug_class_ar, a.is_nsaid, a.warnings_en, a.warnings_ar
    FROM patient_medications pm
    LEFT JOIN medication_products p ON pm.medication_product_id = p.id
    LEFT JOIN active_ingredients a ON pm.active_ingredient_id = a.id
    WHERE pm.user_id = ? AND pm.is_active = 1
  `).all(patientId);
    // Load Symptoms according to consent scope
    let symptomSql = `
    SELECT s.*, 
           a.name_en as active_name_en, a.name_ar as active_name_ar,
           p.brand_name_en, p.brand_name_ar
    FROM symptom_logs s
    LEFT JOIN active_ingredients a ON s.active_ingredient_id = a.id
    LEFT JOIN medication_products p ON s.medication_product_id = p.id
    WHERE s.user_id = ?
  `;
    if (grant.scope === 'selected_symptoms' && grant.allowed_symptom_ids) {
        try {
            const ids = JSON.parse(grant.allowed_symptom_ids);
            if (ids.length > 0) {
                const placeholders = ids.map(() => '?').join(',');
                symptomSql += ` AND s.id IN (${placeholders})`;
            }
        }
        catch { }
    }
    symptomSql += ' ORDER BY s.start_date DESC';
    const symptoms = db.prepare(symptomSql).all(patientId);
    // Load Follow-up notes
    const followUp = db.prepare(`
    SELECT * FROM follow_up_requests
    WHERE patient_id = ? AND pharmacist_id = ?
    ORDER BY created_at DESC LIMIT 1
  `).get(patientId, pharmacistId);
    // Audit this professional access
    directAuditLog(pharmacistId, 'PHARMACIST_ACCESSED_PATIENT_RECORDS', 'patient_profiles', patientId, 'Pharmacist inspected authorized medical record');
    res.json({
        patient: {
            id: patient.id,
            displayName: patient.display_name,
            ageRange: profile ? profile.age_range : null,
            emergencyContact: profile ? profile.emergency_contact : null,
            notes: profile ? profile.notes : null,
        },
        consentDetails: {
            grantId: grant.id,
            expiresAt: grant.expires_at,
            scope: grant.scope,
        },
        medications: medications.map((m) => ({
            ...m,
            is_nsaid: m.is_nsaid === 1,
        })),
        symptoms: symptoms.map((s) => ({
            ...s,
            is_ongoing: s.is_ongoing === 1,
            impact_daily_activities: s.impact_daily_activities === 1,
            impact_balance: s.impact_balance === 1,
            impact_walking: s.impact_walking === 1,
            impact_mobility: s.impact_mobility === 1,
            fatigue_during_activities: s.fatigue_during_activities === 1,
        })),
        followUp,
    });
});
// POST /api/pharmacist/follow-up/:requestId/note - save clinical note & mark status
pharmacistRouter.post('/follow-up/:requestId/note', (req, res) => {
    const pharmacistId = req.user.id;
    const requestId = req.params.requestId;
    const { clinicalNote, status = 'completed' } = req.body;
    if (!clinicalNote) {
        return res.status(400).json({ error: 'Clinical note cannot be empty' });
    }
    const existing = db.prepare('SELECT * FROM follow_up_requests WHERE id = ? AND pharmacist_id = ?').get(requestId, pharmacistId);
    if (!existing) {
        return res.status(404).json({ error: 'Follow-up request not found or unauthorized' });
    }
    const now = new Date().toISOString();
    db.prepare(`
    UPDATE follow_up_requests
    SET pharmacist_notes = ?,
        status = ?,
        completed_at = ?,
        updated_at = ?
    WHERE id = ?
  `).run(clinicalNote, status, status === 'completed' ? now : null, now, requestId);
    directAuditLog(pharmacistId, 'PHARMACIST_NOTE_RECORDED', 'follow_up_requests', requestId, `Status updated to ${status}`);
    res.json({
        message: 'Clinical note saved successfully.',
        messageAr: 'تم حفظ الملاحظة الإكلينيكية وتحديث حالة المتابعة بنجاح.',
    });
});
