import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { evaluateSymptomSafety } from '../services/safetyEngine.js';
import { directAuditLog } from '../middleware/audit.js';
export const symptomsRouter = Router();
const SymptomCreateSchema = z.object({
    activeIngredientId: z.string().optional().nullable(),
    medicationProductId: z.string().optional().nullable(),
    symptomName: z.string().min(1, 'Symptom name is required'),
    symptomNameAr: z.string().optional(),
    startDate: z.string().min(1, 'Start date is required'),
    startTime: z.string().optional(),
    severity: z.enum(['mild', 'moderate', 'severe']),
    duration: z.string().optional(),
    isOngoing: z.boolean().default(true),
    impactDailyActivities: z.boolean().default(false),
    impactBalance: z.boolean().default(false),
    impactWalking: z.boolean().default(false),
    impactMobility: z.boolean().default(false),
    fatigueDuringActivities: z.boolean().default(false),
    notes: z.string().optional(),
    isSharedWithPharmacist: z.boolean().default(true),
});
// GET /api/symptoms - list user symptoms with filters
symptomsRouter.get('/', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { medicationId, severity, startDate, endDate } = req.query;
    let sql = `
    SELECT s.*, 
           a.name_en as active_name_en, a.name_ar as active_name_ar,
           p.brand_name_en, p.brand_name_ar
    FROM symptom_logs s
    LEFT JOIN active_ingredients a ON s.active_ingredient_id = a.id
    LEFT JOIN medication_products p ON s.medication_product_id = p.id
    WHERE s.user_id = ?
  `;
    const params = [userId];
    if (medicationId) {
        sql += ' AND (s.active_ingredient_id = ? OR s.medication_product_id = ?)';
        params.push(medicationId, medicationId);
    }
    if (severity) {
        sql += ' AND s.severity = ?';
        params.push(severity);
    }
    if (startDate) {
        sql += ' AND s.start_date >= ?';
        params.push(startDate);
    }
    if (endDate) {
        sql += ' AND s.start_date <= ?';
        params.push(endDate);
    }
    sql += ' ORDER BY s.start_date DESC, s.created_at DESC';
    const symptoms = db.prepare(sql).all(...params);
    res.json({
        symptoms: symptoms.map((s) => ({
            ...s,
            is_ongoing: s.is_ongoing === 1,
            impact_daily_activities: s.impact_daily_activities === 1,
            impact_balance: s.impact_balance === 1,
            impact_walking: s.impact_walking === 1,
            impact_mobility: s.impact_mobility === 1,
            fatigue_during_activities: s.fatigue_during_activities === 1,
            is_shared_with_pharmacist: s.is_shared_with_pharmacist === 1,
        })),
        total: symptoms.length,
    });
});
// POST /api/symptoms - log new symptom + run safety rule
symptomsRouter.post('/', authenticateToken, (req, res) => {
    try {
        const data = SymptomCreateSchema.parse(req.body);
        const userId = req.user.id;
        const symptomId = 'sym-' + Date.now();
        const now = new Date().toISOString();
        // 1. Run deterministic safety evaluation
        const safetyCheck = evaluateSymptomSafety(data.symptomName, data.notes, data.severity);
        // 2. Insert symptom log
        db.prepare(`
      INSERT INTO symptom_logs (
        id, user_id, active_ingredient_id, medication_product_id, symptom_name, symptom_name_ar,
        start_date, start_time, severity, duration, is_ongoing,
        impact_daily_activities, impact_balance, impact_walking, impact_mobility, fatigue_during_activities,
        notes, is_shared_with_pharmacist, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(symptomId, userId, data.activeIngredientId || null, data.medicationProductId || null, data.symptomName, data.symptomNameAr || null, data.startDate, data.startTime || null, data.severity, data.duration || null, data.isOngoing ? 1 : 0, data.impactDailyActivities ? 1 : 0, data.impactBalance ? 1 : 0, data.impactWalking ? 1 : 0, data.impactMobility ? 1 : 0, data.fatigueDuringActivities ? 1 : 0, data.notes || null, data.isSharedWithPharmacist ? 1 : 0, now, now);
        // 3. If critical or warning safety alert triggered, record in safety_alerts table
        let alertRecord = null;
        if (safetyCheck.alertLevel !== 'info') {
            const alertId = 'alt-' + Date.now();
            db.prepare(`
        INSERT INTO safety_alerts (id, user_id, symptom_log_id, alert_level, trigger_reason, recommendation_en, recommendation_ar, dismissed, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
      `).run(alertId, userId, symptomId, safetyCheck.alertLevel, safetyCheck.triggerReason, safetyCheck.recommendationEn, safetyCheck.recommendationAr, now);
            alertRecord = {
                alertId,
                level: safetyCheck.alertLevel,
                triggerReason: safetyCheck.triggerReason,
                recommendationEn: safetyCheck.recommendationEn,
                recommendationAr: safetyCheck.recommendationAr,
                emergencyActionRequired: safetyCheck.emergencyActionRequired,
                emergencyNumberEgypt: safetyCheck.emergencyNumberEgypt,
            };
        }
        directAuditLog(userId, 'SYMPTOM_LOGGED', 'symptom_logs', symptomId, `Logged symptom: ${data.symptomName} (Severity: ${data.severity})`);
        res.status(201).json({
            message: 'Symptom logged successfully',
            messageAr: 'تم تسجيل العرض بنجاح',
            symptomId,
            safetyCheck,
            safetyAlert: alertRecord,
        });
    }
    catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.issues?.[0]?.message || 'Validation error' });
        }
        console.error('Symptom create error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// PUT /api/symptoms/:id
symptomsRouter.put('/:id', authenticateToken, (req, res) => {
    const symptomId = req.params.id;
    const userId = req.user.id;
    const existing = db.prepare('SELECT id FROM symptom_logs WHERE id = ? AND user_id = ?').get(symptomId, userId);
    if (!existing) {
        return res.status(404).json({ error: 'Symptom log not found or unauthorized' });
    }
    const { symptomName, severity, duration, isOngoing, impactBalance, impactWalking, impactMobility, notes } = req.body;
    const now = new Date().toISOString();
    db.prepare(`
    UPDATE symptom_logs
    SET symptom_name = COALESCE(?, symptom_name),
        severity = COALESCE(?, severity),
        duration = COALESCE(?, duration),
        is_ongoing = COALESCE(?, is_ongoing),
        impact_balance = COALESCE(?, impact_balance),
        impact_walking = COALESCE(?, impact_walking),
        impact_mobility = COALESCE(?, impact_mobility),
        notes = COALESCE(?, notes),
        updated_at = ?
    WHERE id = ? AND user_id = ?
  `).run(symptomName, severity, duration, isOngoing !== undefined ? (isOngoing ? 1 : 0) : undefined, impactBalance !== undefined ? (impactBalance ? 1 : 0) : undefined, impactWalking !== undefined ? (impactWalking ? 1 : 0) : undefined, impactMobility !== undefined ? (impactMobility ? 1 : 0) : undefined, notes, now, symptomId, userId);
    directAuditLog(userId, 'SYMPTOM_UPDATED', 'symptom_logs', symptomId, 'Updated symptom record');
    res.json({ message: 'Symptom updated', messageAr: 'تم تحديث السجل بنجاح' });
});
// DELETE /api/symptoms/:id
symptomsRouter.delete('/:id', authenticateToken, (req, res) => {
    const symptomId = req.params.id;
    const userId = req.user.id;
    const result = db.prepare('DELETE FROM symptom_logs WHERE id = ? AND user_id = ?').run(symptomId, userId);
    if (result.changes === 0) {
        return res.status(404).json({ error: 'Symptom log not found or unauthorized' });
    }
    directAuditLog(userId, 'SYMPTOM_DELETED', 'symptom_logs', symptomId, 'Deleted symptom record');
    res.json({ message: 'Symptom record deleted', messageAr: 'تم حذف السجل بنجاح' });
});
// GET /api/symptoms/active-medications (Patient Medications list)
symptomsRouter.get('/active-medications', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const meds = db.prepare(`
    SELECT pm.*, 
           p.brand_name_en, p.brand_name_ar, p.strength as product_strength, p.formulation,
           a.name_en as active_name_en, a.name_ar as active_name_ar, a.drug_class_en, a.drug_class_ar, a.is_nsaid
    FROM patient_medications pm
    LEFT JOIN medication_products p ON pm.medication_product_id = p.id
    LEFT JOIN active_ingredients a ON pm.active_ingredient_id = a.id
    WHERE pm.user_id = ? AND pm.is_active = 1
    ORDER BY pm.created_at DESC
  `).all(userId);
    res.json({
        medications: meds.map((m) => ({
            ...m,
            is_nsaid: m.is_nsaid === 1,
        })),
    });
});
// POST /api/symptoms/active-medications (Add medication to patient profile)
symptomsRouter.post('/active-medications', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { activeIngredientId, medicationProductId, customName, dosage, frequency, startDate } = req.body;
    const id = 'pmed-' + Date.now();
    db.prepare(`
    INSERT INTO patient_medications (id, user_id, active_ingredient_id, medication_product_id, custom_name, dosage, frequency, start_date, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `).run(id, userId, activeIngredientId || null, medicationProductId || null, customName || null, dosage || null, frequency || null, startDate || null, new Date().toISOString());
    directAuditLog(userId, 'MEDICATION_ADDED_TO_PROFILE', 'patient_medications', id, `Added medication`);
    res.status(201).json({ message: 'Medication added to your profile', messageAr: 'تم إضافة الدواء إلى ملفك الشخصي' });
});
// DELETE /api/symptoms/active-medications/:id
symptomsRouter.delete('/active-medications/:id', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const id = req.params.id;
    const resDel = db.prepare('DELETE FROM patient_medications WHERE id = ? AND user_id = ?').run(id, userId);
    if (resDel.changes === 0) {
        return res.status(404).json({ error: 'Medication not found' });
    }
    res.json({ message: 'Medication removed', messageAr: 'تم حذف الدواء من قائمتك' });
});
