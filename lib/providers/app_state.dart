import 'package:flutter/material.dart';
import '../models/models.dart';
import '../data/salus_data.dart';
import '../services/safety_service.dart';

class AppState extends ChangeNotifier {
  // Language & RTL State
  String _language = 'ar';
  String get language => _language;
  bool get isRtl => _language == 'ar';

  void setLanguage(String lang) {
    _language = lang;
    notifyListeners();
  }

  void toggleLanguage() {
    _language = _language == 'ar' ? 'en' : 'ar';
    notifyListeners();
  }

  // Pre-configured Demo Users
  static final AppUser demoPatient = AppUser(
    id: 'usr-patient-1',
    email: 'patient@salus.eg',
    displayName: 'أحمد حسن (Ahmed Hassan)',
    role: 'patient',
  );

  static final AppUser demoVerifiedPharmacist = AppUser(
    id: 'usr-pharm-1',
    email: 'pharmacist@salus.eg',
    displayName: 'د. مريم فاروق (Dr. Mariam Farouk)',
    role: 'pharmacist',
    pharmacistVerificationStatus: 'verified',
  );

  static final AppUser demoPendingPharmacist = AppUser(
    id: 'usr-pharm-pending',
    email: 'pending.pharmacist@salus.eg',
    displayName: 'د. كريم زكي (Dr. Karim Zaki)',
    role: 'pharmacist',
    pharmacistVerificationStatus: 'pending',
  );

  // Current User
  AppUser? _currentUser;
  AppUser? get currentUser => _currentUser;
  bool get isAuthenticated => _currentUser != null;

  void loginAs(AppUser user) {
    _currentUser = user;
    notifyListeners();
  }

  void logout() {
    _currentUser = null;
    notifyListeners();
  }

  // Current Patient Active Prescriptions
  List<MedicationProduct> _patientMeds = [
    SalusData.products[0], // Norvasc 5mg
    SalusData.products[11], // Glucophage 1000mg
  ];
  List<MedicationProduct> get patientMeds => _patientMeds;

  void addPatientMed(MedicationProduct med) {
    if (!_patientMeds.any((m) => m.id == med.id)) {
      _patientMeds.add(med);
      notifyListeners();
    }
  }

  void removePatientMed(String productId) {
    _patientMeds.removeWhere((m) => m.id == productId);
    notifyListeners();
  }

  // Patient Symptoms Log
  List<SymptomLog> _symptoms = [
    SymptomLog(
      id: 'sym-1',
      symptomName: 'تورم ملحوظ في الكاحلين والقدمين (Ankle Edema)',
      medicationName: 'Norvasc 5mg',
      startDate: '2026-02-10',
      startTime: '18:00',
      severity: 'moderate',
      duration: '5 days',
      isOngoing: true,
      impactDailyActivities: true,
      impactBalance: false,
      impactWalking: true,
      impactMobility: true,
      fatigueDuringActivities: false,
      notes: 'لاحظت انتفاخاً حول الكاحلين في المساء ويزداد عند المشي أو الوقوف فترة طويلة.',
    ),
    SymptomLog(
      id: 'sym-2',
      symptomName: 'دوخة خفيفة عند الاستيقاظ (Dizziness)',
      medicationName: 'Norvasc 5mg',
      startDate: '2026-02-12',
      startTime: '08:30',
      severity: 'mild',
      duration: 'Few minutes',
      isOngoing: false,
      impactDailyActivities: false,
      impactBalance: true,
      impactWalking: false,
      impactMobility: false,
      fatigueDuringActivities: false,
      notes: 'دوار يستمر لثوانٍ معدودة عند الانتقال السريع من السرير إلى وضع الوقوف.',
    ),
  ];
  List<SymptomLog> get symptoms => _symptoms;

  SafetyCheckResult addSymptom({
    required String name,
    String? medName,
    required String severity,
    required String duration,
    required bool isOngoing,
    required bool impactDaily,
    required bool impactBalance,
    required bool impactWalking,
    required bool impactMobility,
    required bool fatigue,
    required String notes,
  }) {
    final now = DateTime.now();
    final newSym = SymptomLog(
      id: 'sym-${now.millisecondsSinceEpoch}',
      symptomName: name,
      medicationName: medName,
      startDate: '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}',
      startTime: '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}',
      severity: severity,
      duration: duration,
      isOngoing: isOngoing,
      impactDailyActivities: impactDaily,
      impactBalance: impactBalance,
      impactWalking: impactWalking,
      impactMobility: impactMobility,
      fatigueDuringActivities: fatigue,
      notes: notes,
    );

    _symptoms.insert(0, newSym);
    notifyListeners();

    // Check emergency red flags
    return SafetyService.evaluateSymptom(name, notes, severity);
  }

  void deleteSymptom(String id) {
    _symptoms.removeWhere((s) => s.id == id);
    notifyListeners();
  }

  // Consent Grants
  List<ConsentGrant> _grants = [
    ConsentGrant(
      id: 'cst-1',
      invitationCode: 'SALUS-AHMED-7892',
      scope: 'all_symptoms',
      isRevoked: false,
      expiresAt: '2026-03-01',
      pharmacistName: 'د. مريم فاروق (صيدلية النيل)',
    ),
  ];
  List<ConsentGrant> get grants => _grants;

  String generateInviteCode() {
    final now = DateTime.now();
    final code = 'SALUS-${now.millisecondsSinceEpoch.toString().substring(7)}-${now.microsecond.toString().padLeft(4, '0')}';
    final grant = ConsentGrant(
      id: 'cst-${now.millisecondsSinceEpoch}',
      invitationCode: code,
      scope: 'all_symptoms',
      isRevoked: false,
      expiresAt: '${now.year}-${(now.month + 1).toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}',
    );
    _grants.insert(0, grant);
    notifyListeners();
    return code;
  }

  void revokeGrant(String id) {
    final idx = _grants.indexWhere((g) => g.id == id);
    if (idx != -1) {
      final old = _grants[idx];
      _grants[idx] = ConsentGrant(
        id: old.id,
        invitationCode: old.invitationCode,
        scope: old.scope,
        isRevoked: true,
        expiresAt: old.expiresAt,
        pharmacistName: old.pharmacistName,
      );
      notifyListeners();
    }
  }

  // Pharmacist Follow-Up Cases
  List<FollowUpCase> _cases = [
    FollowUpCase(
      id: 'case-1',
      patientName: 'أحمد حسن (Ahmed Hassan)',
      invitationCode: 'SALUS-AHMED-7892',
      patientNotes: 'أعاني من تورم في الكاحل بعد أسبوعين من أخذ نورفاسك 5 مجم، هل هذا طبيعي؟',
      pharmacistNotes: 'تمت مراجعة الأعراض: التورم في الكاحل متوافق مع الآثار الجانبية الموثقة للأملوديبين (تصل النسبة إلى 10.8% في الجرعات العالية). تم توجيه المريض بعدم إيقاف الدواء ذاتياً، ومراجعة الطبيب المعالج للنظر في تقليل الجرعة أو إضافة ARB لتقليل ارتشاح السوائل.',
      status: 'completed',
      createdAt: '2026-02-14',
    ),
  ];
  List<FollowUpCase> get cases => _cases;

  bool connectPatientCode(String code) {
    final clean = code.trim().toUpperCase();
    if (_cases.any((c) => c.invitationCode == clean)) {
      return true;
    }
    // Match against patient grant
    final grant = _grants.firstWhere(
      (g) => g.invitationCode == clean && !g.isRevoked,
      orElse: () => ConsentGrant(id: '', invitationCode: '', scope: '', isRevoked: true, expiresAt: ''),
    );

    if (grant.id.isNotEmpty) {
      _cases.insert(
        0,
        FollowUpCase(
          id: 'case-${DateTime.now().millisecondsSinceEpoch}',
          patientName: 'أحمد حسن (مريض معتمد)',
          invitationCode: clean,
          patientNotes: 'مراجعة سريرية للأعراض المسجلة وتأثيرها على الحركة',
          status: 'in_review',
          createdAt: DateTime.now().toString().split(' ')[0],
        ),
      );
      notifyListeners();
      return true;
    }
    return false;
  }

  void savePharmacistNote(String caseId, String note) {
    final idx = _cases.indexWhere((c) => c.id == caseId);
    if (idx != -1) {
      _cases[idx].pharmacistNotes = note;
      _cases[idx].status = 'completed';
      notifyListeners();
    }
  }
}
