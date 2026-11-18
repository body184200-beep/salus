import test from 'node:test';
import assert from 'node:assert/strict';
import { db, initDatabase } from '../db/database.js';
import { seedDatabase } from '../db/seeds.js';
import { evaluateSymptomSafety } from '../services/safetyEngine.js';
import { processAssistantQuery } from '../services/voiceAssistant.js';
import { matchOcrTextToCatalog } from '../services/ocrService.js';
import { compileReportData } from '../services/reportService.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

test('SALUS Comprehensive Test Suite', async (t) => {
  // Ensure DB initialized and seeded
  initDatabase();
  await seedDatabase();

  await t.test('1. Database Seed and Medication Scope', () => {
    const categories = db.prepare('SELECT * FROM medication_categories').all();
    assert.equal(categories.length, 3, 'Must have exactly 3 medication categories');

    const ingredients = db.prepare('SELECT * FROM active_ingredients').all() as any[];
    assert.equal(ingredients.length, 9, 'Must have exactly 9 active ingredients');

    // Test Paracetamol is non-NSAID
    const paracetamol = ingredients.find((i) => i.id === 'ing-paracetamol');
    assert.ok(paracetamol, 'Paracetamol must be present');
    assert.equal(paracetamol.is_nsaid, 0, 'Paracetamol must NOT be classified as an NSAID');

    // Test Ibuprofen and Diclofenac are NSAIDs
    const ibuprofen = ingredients.find((i) => i.id === 'ing-ibuprofen');
    const diclofenac = ingredients.find((i) => i.id === 'ing-diclofenac');
    assert.equal(ibuprofen.is_nsaid, 1, 'Ibuprofen must be classified as an NSAID');
    assert.equal(diclofenac.is_nsaid, 1, 'Diclofenac must be classified as an NSAID');

    // Test Egyptian Brand Mappings
    const norvasc = db.prepare('SELECT * FROM medication_products WHERE brand_name_en = ?').get('Norvasc');
    assert.ok(norvasc, 'Norvasc must be mapped to Amlodipine');
  });

  await t.test('2. User Authentication and Role Permissions', async () => {
    const patient = db.prepare('SELECT * FROM users WHERE email = ?').get('patient@salus.eg') as any;
    assert.ok(patient, 'Demo patient must exist');
    assert.equal(patient.role, 'patient');

    const matchPass = await bcrypt.compare('SalusDemo2026!', patient.password_hash);
    assert.equal(matchPass, true, 'Password hashing must verify correctly');

    // Pharmacist verified status check
    const verifiedPharm = db.prepare(`
      SELECT u.*, p.verification_status 
      FROM users u 
      JOIN pharmacist_profiles p ON u.id = p.user_id 
      WHERE u.email = ?
    `).get('pharmacist@salus.eg') as any;
    assert.equal(verifiedPharm.verification_status, 'verified', 'Dr. Mariam Farouk must be verified');

    const pendingPharm = db.prepare(`
      SELECT u.*, p.verification_status 
      FROM users u 
      JOIN pharmacist_profiles p ON u.id = p.user_id 
      WHERE u.email = ?
    `).get('pending.pharmacist@salus.eg') as any;
    assert.equal(pendingPharm.verification_status, 'pending', 'Dr. Karim Zaki must be pending');

    // Demo Clinical Pharmacist Dr. Samar Alsayed Mohamed Hashem check
    const samar = db.prepare('SELECT * FROM users WHERE email = ?').get('samar@salus.eg') as any;
    assert.ok(samar, 'Demo Clinical Pharmacist Samar must exist');
    assert.equal(samar.role, 'pharmacist');
    assert.ok(samar.display_name.includes('سمر السيد محمد هاشم'), 'Name must be Samar Alsayed Mohamed Hashem');
    assert.ok(samar.display_name.includes('د.'), 'Title must be Dr.');

    // Profile check
    const samarProfile = db.prepare('SELECT * FROM pharmacist_profiles WHERE user_id = ?').get(samar.id) as any;
    assert.ok(samarProfile, 'Samar profile must exist');
    assert.equal(samarProfile.verification_status, 'verified');
    assert.ok(samarProfile.full_name.includes('النقابة العامة لصيادلة مصر'));

    // Demo Doctor Mohamed Tarek check
    const doctor = db.prepare('SELECT * FROM users WHERE email = ?').get('doctor@salus.eg') as any;
    assert.ok(doctor, 'Demo Doctor must exist');
    assert.equal(doctor.role, 'doctor');
  });

  await t.test('3. Deterministic Safety Engine & Emergency Red Flags', () => {
    // Dyspnea / breathing difficulty in English
    const check1 = evaluateSymptomSafety('I have severe shortness of breath and chest tightness');
    assert.equal(check1.isCriticalAlert, true);
    assert.equal(check1.alertLevel, 'urgent_emergency');
    assert.equal(check1.emergencyNumberEgypt, '123');

    // Breathing difficulty in Arabic
    const check2 = evaluateSymptomSafety('عندي ضيق شديد في التنفس وتورم في الزور والشفايف');
    assert.equal(check2.isCriticalAlert, true);
    assert.equal(check2.alertLevel, 'urgent_emergency');

    // GI Bleeding signs (Black tarry stool)
    const check3 = evaluateSymptomSafety('لاحظت براز أسود قطراني بعد أخذ البروفين');
    assert.equal(check3.isCriticalAlert, true);
    assert.equal(check3.alertLevel, 'urgent_emergency');

    // Routine symptom should not trigger emergency alert
    const check4 = evaluateSymptomSafety('Mild dry mouth in the morning', undefined, 'mild');
    assert.equal(check4.isCriticalAlert, false);
    assert.equal(check4.alertLevel, 'info');
  });

  await t.test('4. Voice / Evidence-based Assistant & Uncertainty Handling', () => {
    // Test Amlodipine & Dizziness question (from Prompt Section 9)
    const response1 = processAssistantQuery('أنا باخد أملوديبين وحاسس بدوخة، ده ممكن يكون من الدوا؟', 'ar');
    assert.ok(response1.detectedMedication, 'Must detect Amlodipine');
    assert.equal(response1.detectedMedication.nameEn, 'Amlodipine');
    assert.ok(response1.associatedAdverseEffect, 'Must retrieve clinical trial evidence');
    assert.match(response1.answerTextAr, /لا تؤكد ولا تجزم/i, 'Must never definitively claim drug caused symptom without doctor review');
    assert.match(response1.answerTextAr, /يحظر تماماً إيقاف الدواء/i, 'Must warn against abrupt cessation');

    // Out of scope drug question -> must explicitly display verified fallback
    const response2 = processAssistantQuery('What are the side effects of Amoxicillin?', 'en');
    assert.equal(response2.mode, 'out_of_scope_boundary');
    assert.equal(response2.unsupportedNoticeEn, 'Reliable information is not currently available.');
    assert.equal(response2.unsupportedNoticeAr, 'المعلومة دي مش متوفرة بشكل موثوق حاليًا.');
  });

  await t.test('5. OCR Packaging Text Recognition and Uncertainty Confirmation', () => {
    // Simulated packaging text from camera/photo
    const ocrResult = matchOcrTextToCatalog('NORVASC 5mg Pfizer Amlodipine besylate oral tablets 30 tabs');
    assert.ok(ocrResult.candidates.length > 0, 'Must match candidates');
    assert.equal(ocrResult.candidates[0].brandNameEn, 'Norvasc');
    assert.equal(ocrResult.candidates[0].activeIngredientEn, 'Amlodipine');
    assert.equal(ocrResult.requiresUserConfirmation, true, 'Safety check must require user confirmation');
    assert.ok(ocrResult.uncertaintyWarningEn.length > 0);

    // Unrecognized text
    const ocrFail = matchOcrTextToCatalog('Unrecognized random illegible text xyz 123');
    assert.equal(ocrFail.candidates.length, 0);
  });

  await t.test('6. Consent-Based Sharing and Revocation', () => {
    // Verify consent grant can be created and revoked
    const patientId = 'usr-patient-1';
    const testCode = 'SALUS-TEST-' + Date.now();
    const grantId = 'cst-test-' + Date.now();
    const expiresAt = new Date(Date.now() + 86400000).toISOString();

    db.prepare(`
      INSERT INTO consent_grants (id, patient_id, invitation_code, scope, is_revoked, expires_at, created_at)
      VALUES (?, ?, ?, 'all_symptoms', 0, ?, datetime('now'))
    `).run(grantId, patientId, testCode, expiresAt);

    let grant = db.prepare('SELECT * FROM consent_grants WHERE id = ?').get(grantId) as any;
    assert.equal(grant.is_revoked, 0);

    // Revoke
    db.prepare("UPDATE consent_grants SET is_revoked = 1, revoked_at = datetime('now') WHERE id = ?").run(grantId);
    grant = db.prepare('SELECT * FROM consent_grants WHERE id = ?').get(grantId) as any;
    assert.equal(grant.is_revoked, 1, 'Consent must be marked revoked');
  });

  await t.test('7. Report Generation Compilation', () => {
    const reportData = compileReportData('usr-patient-1');
    assert.ok(reportData.reportId.startsWith('SALUS-REP-'));
    assert.ok(reportData.medications.length > 0);
    assert.ok(reportData.disclaimerEn.includes('CRITICAL MEDICAL DISCLAIMER'));
    assert.ok(reportData.disclaimerAr.includes('إخلاء مسؤولية طبي هام'));
  });
});
