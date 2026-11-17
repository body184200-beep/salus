import '../models/models.dart';

class SafetyService {
  static SafetyCheckResult evaluateSymptom(String symptom, [String? notes, String? severity]) {
    final text = '$symptom ${notes ?? ''}'.toLowerCase();

    // 1. Respiratory / Anaphylaxis
    if (text.contains('ضيق') && (text.contains('تنفس') || text.contains('الصدر')) ||
        text.contains('صعوبة في التنفس') ||
        text.contains('مش قادر اتنفس') ||
        text.contains('breath') ||
        text.contains('shortness') ||
        text.contains('swelling') && (text.contains('throat') || text.contains('face') || text.contains('lip') || text.contains('tongue')) ||
        text.contains('تورم في الزور') ||
        text.contains('تورم في الوجه') ||
        text.contains('تزييق')) {
      return SafetyCheckResult(
        isCriticalAlert: true,
        alertLevel: 'urgent_emergency',
        triggerReason: 'اشتباه في قصور تنفسي حاد أو حساسية مفرطة وتورم بالمسالك الهوائية (Respiratory Distress / Anaphylaxis)',
        recommendationAr: 'إجراء طارئ فوري: اتصل بالإسعاف (123) فوراً أو توجه لأقرب قسم طوارئ. اجلس في وضع مستقيم ولا تستلقِ.',
        recommendationEn: 'IMMEDIATE EMERGENCY: Seek immediate emergency room care or call ambulance (Egypt: 123). Do not lie flat.',
      );
    }

    // 2. Cardiac / Chest Pain
    if (text.contains('صدر') && (text.contains('ألم') || text.contains('وجع') || text.contains('ضغط') || text.contains('ثقل')) ||
        text.contains('chest pain') ||
        text.contains('heart attack') ||
        text.contains('ذبحة')) {
      return SafetyCheckResult(
        isCriticalAlert: true,
        alertLevel: 'urgent_emergency',
        triggerReason: 'اشتباه في متلازمة الشريان التاجي الحادة أو نوبة قلبية (Acute Coronary Syndrome)',
        recommendationAr: 'اتصل بالإسعاف (123) فوراً: توقف عن أي مجهود بدني واجلس بهدوء حتى وصول الرعاية الطبية.',
        recommendationEn: 'CALL 123 IMMEDIATELY: Stop physical exertion, rest seated, and seek emergency cardiac evaluation.',
      );
    }

    // 3. Syncope / Loss of Consciousness
    if (text.contains('إغماء') || text.contains('اغمى') || text.contains('فقدان الوعي') || text.contains('faint') || text.contains('syncope')) {
      return SafetyCheckResult(
        isCriticalAlert: true,
        alertLevel: 'urgent_emergency',
        triggerReason: 'حدوث نوبة إغماء أو هبوط حاد مفاجئ في الدورة الدموية (Syncope / Severe Hypotension)',
        recommendationAr: 'تقييم طارئ: استلقِ وارفع قدميك أعلى من مستوى القلب. يلزم فحص طبي عاجل للتأكد من انتظام ضربات القلب.',
        recommendationEn: 'URGENT: Elevate legs while lying down. Call 123 if consciousness is altered. Immediate evaluation required.',
      );
    }

    // 4. GI Bleeding
    if (text.contains('دم') && (text.contains('براز') || text.contains('ترجيع') || text.contains('قيء')) ||
        text.contains('براز أسود') ||
        text.contains('black stool') ||
        text.contains('vomit blood')) {
      return SafetyCheckResult(
        isCriticalAlert: true,
        alertLevel: 'urgent_emergency',
        triggerReason: 'علامات تشير لاحتمال قرحة نازفة أو نزيف حاد بالجهاز الهضمي (Acute GI Bleeding)',
        recommendationAr: 'أوقف أي مسكنات فوراً وتوجه لأقرب طوارئ مستشفى لتقييم النزيف ونسبة الهيموجلوبين.',
        recommendationEn: 'STOP NSAIDs IMMEDIATELY. Go to emergency department for urgent endoscopic and hemoglobin check.',
      );
    }

    // 5. Severe General Symptom
    if (severity == 'severe') {
      return SafetyCheckResult(
        isCriticalAlert: false,
        alertLevel: 'warning_pharmacist_review',
        triggerReason: 'العرض مسجل بدرجة شدة عالية (Severe)',
        recommendationAr: 'نظراً لأنك سجلت شدة هذا العرض بأنها "شديدة"، نوصي بمشاركة هذا السجل مع الصيدلي أو مراجعة طبيبك المعالج.',
        recommendationEn: 'Because this symptom is rated SEVERE, we strongly recommend sharing this log with your pharmacist.',
      );
    }

    return SafetyCheckResult(
      isCriticalAlert: false,
      alertLevel: 'info',
      triggerReason: 'متابعة روتينية بدون مؤشرات خطر حادة',
      recommendationAr: 'سجل أعراضك بانتظام لمتابعة تطورها ومشاركتها مع الصيدلي في زيارتك القادمة.',
      recommendationEn: 'Record your symptoms consistently to track their progression over time.',
    );
  }
}
