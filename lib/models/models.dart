class AppUser {
  final String id;
  final String email;
  final String displayName;
  final String role; // 'patient', 'pharmacist', 'doctor', 'nurse'
  final String? pharmacistVerificationStatus; // 'verified' or 'pending'

  AppUser({
    required this.id,
    required this.email,
    required this.displayName,
    required this.role,
    this.pharmacistVerificationStatus,
  });

  bool get isPharmacist => role == 'pharmacist';
  bool get isDoctor => role == 'doctor';
  bool get isNurse => role == 'nurse';
  bool get isMedicalProfessional => role == 'pharmacist' || role == 'doctor' || role == 'nurse';
  bool get isVerifiedPharmacist => isDoctor || isNurse || (isPharmacist && pharmacistVerificationStatus == 'verified');
}

class MedicationCategory {
  final String id;
  final String nameEn;
  final String nameAr;
  final String descriptionEn;
  final String descriptionAr;

  MedicationCategory({
    required this.id,
    required this.nameEn,
    required this.nameAr,
    required this.descriptionEn,
    required this.descriptionAr,
  });
}

class ActiveIngredient {
  final String id;
  final String categoryId;
  final String nameEn;
  final String nameAr;
  final String drugClassEn;
  final String drugClassAr;
  final bool isNsaid;
  final String generalPurposeEn;
  final String generalPurposeAr;
  final String warningsEn;
  final String warningsAr;
  final String interactionsEn;
  final String interactionsAr;
  final String lastReviewedDate;

  ActiveIngredient({
    required this.id,
    required this.categoryId,
    required this.nameEn,
    required this.nameAr,
    required this.drugClassEn,
    required this.drugClassAr,
    required this.isNsaid,
    required this.generalPurposeEn,
    required this.generalPurposeAr,
    required this.warningsEn,
    required this.warningsAr,
    required this.interactionsEn,
    required this.interactionsAr,
    required this.lastReviewedDate,
  });
}

class MedicationProduct {
  final String id;
  final String activeIngredientId;
  final String brandNameEn;
  final String brandNameAr;
  final String formulation;
  final String strength;
  final String manufacturer;
  final String edaRegistrationNo;

  MedicationProduct({
    required this.id,
    required this.activeIngredientId,
    required this.brandNameEn,
    required this.brandNameAr,
    required this.formulation,
    required this.strength,
    required this.manufacturer,
    required this.edaRegistrationNo,
  });
}

class AdverseEffect {
  final String id;
  final String activeIngredientId;
  final String nameEn;
  final String nameAr;
  final String descriptionEn;
  final String descriptionAr;
  final String frequencyDisplayEn;
  final String frequencyDisplayAr;
  final String sourceStudy;
  final String sampleSize;
  final String comparator;
  final String severity; // 'mild', 'moderate', 'severe', 'critical'
  final String timeToOnsetEn;
  final String timeToOnsetAr;
  final String durationEn;
  final String durationAr;

  AdverseEffect({
    required this.id,
    required this.activeIngredientId,
    required this.nameEn,
    required this.nameAr,
    required this.descriptionEn,
    required this.descriptionAr,
    required this.frequencyDisplayEn,
    required this.frequencyDisplayAr,
    required this.sourceStudy,
    required this.sampleSize,
    required this.comparator,
    required this.severity,
    required this.timeToOnsetEn,
    required this.timeToOnsetAr,
    required this.durationEn,
    required this.durationAr,
  });
}

class SymptomLog {
  final String id;
  final String symptomName;
  final String? medicationName;
  final String startDate;
  final String startTime;
  final String severity; // 'mild', 'moderate', 'severe'
  final String duration;
  final bool isOngoing;
  final bool impactDailyActivities;
  final bool impactBalance;
  final bool impactWalking;
  final bool impactMobility;
  final bool fatigueDuringActivities;
  final String notes;

  SymptomLog({
    required this.id,
    required this.symptomName,
    this.medicationName,
    required this.startDate,
    required this.startTime,
    required this.severity,
    required this.duration,
    required this.isOngoing,
    required this.impactDailyActivities,
    required this.impactBalance,
    required this.impactWalking,
    required this.impactMobility,
    required this.fatigueDuringActivities,
    required this.notes,
  });
}

class ConsentGrant {
  final String id;
  final String invitationCode;
  final String scope;
  final bool isRevoked;
  final String expiresAt;
  final String? pharmacistName;

  ConsentGrant({
    required this.id,
    required this.invitationCode,
    required this.scope,
    required this.isRevoked,
    required this.expiresAt,
    this.pharmacistName,
  });
}

class FollowUpCase {
  final String id;
  final String patientName;
  final String invitationCode;
  final String? patientNotes;
  String? pharmacistNotes;
  String status; // 'pending', 'in_review', 'completed'
  final String createdAt;

  FollowUpCase({
    required this.id,
    required this.patientName,
    required this.invitationCode,
    this.patientNotes,
    this.pharmacistNotes,
    required this.status,
    required this.createdAt,
  });
}

class SafetyCheckResult {
  final bool isCriticalAlert;
  final String alertLevel; // 'urgent_emergency', 'warning_pharmacist_review', 'info'
  final String triggerReason;
  final String recommendationEn;
  final String recommendationAr;
  final String emergencyNumber;

  SafetyCheckResult({
    required this.isCriticalAlert,
    required this.alertLevel,
    required this.triggerReason,
    required this.recommendationEn,
    required this.recommendationAr,
    this.emergencyNumber = '123',
  });
}
