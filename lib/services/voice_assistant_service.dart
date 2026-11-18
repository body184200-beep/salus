import '../models/models.dart';
import 'safety_service.dart';

class VoiceAssistantResponse {
  final String answerAr;
  final String answerEn;
  final SafetyCheckResult? safetyAlert;
  final List<String> clarifyingQuestionsAr;
  final List<String> clarifyingQuestionsEn;
  final String sourceTitle;

  VoiceAssistantResponse({
    required this.answerAr,
    required this.answerEn,
    this.safetyAlert,
    required this.clarifyingQuestionsAr,
    required this.clarifyingQuestionsEn,
    required this.sourceTitle,
  });
}

class VoiceAssistantService {
  static VoiceAssistantResponse answerQuery(String query) {
    final lower = query.toLowerCase();

    // 1. Emergency safety check
    final safety = SafetyService.evaluateSymptom(query);
    if (safety.isCriticalAlert) {
      return VoiceAssistantResponse(
        answerAr: 'تحذير طبي طارئ: الأعراض المذكورة ("${safety.triggerReason}") تستدعي رعاية طبية عاجلة فوراً. يرجى الاتصال بالإسعاف (123) أو التوجه لأقرب طوارئ. ${safety.recommendationAr}',
        answerEn: 'EMERGENCY WARNING: The symptoms described require immediate clinical attention. Call ambulance (Egypt: 123) or proceed to nearest emergency room. ${safety.recommendationEn}',
        safetyAlert: safety,
        clarifyingQuestionsAr: [],
        clarifyingQuestionsEn: [],
        sourceTitle: 'Emergency Triage Protocol (Egypt MOH / 123)',
      );
    }

    // Nurse identity response
    if (lower.contains('مين انت') || lower.contains('اسمك') || lower.contains('الممرضة') || lower.contains('شهد') || lower.contains('nurse')) {
      return VoiceAssistantResponse(
        answerAr: 'أنا الممرضة شهد السيد هاشم، المساعد التمريضي الإكلينيكي في منصة سالوس. أساعدك في فهم أدويتك وشرح الآثار الجانبية بناءً على الأدلة الطبية وتسهيل التواصل مع طبيبك أو صيدليك.',
        answerEn: 'I am Nurse Shahd El-Sayed Hashem, your clinical nurse assistant on SALUS. I help you understand your medications and adverse effects based on clinical trials, and connect with your doctor or pharmacist.',
        clarifyingQuestionsAr: ['هل تود الاستفسار عن أحد أدويتك أو عرض تشعر به؟'],
        clarifyingQuestionsEn: ['Do you have questions about your prescribed medications or symptoms?'],
        sourceTitle: 'SALUS Clinical Nursing Support Protocol',
      );
    }

    // 2. Amlodipine & Dizziness / Edema question (Core example in prompt)
    if (lower.contains('أملوديبين') || lower.contains('amlodipine') || lower.contains('نورفاسك') || lower.contains('norvasc')) {
      if (lower.contains('دوخة') || lower.contains('dizz') || lower.contains('دوار')) {
        return VoiceAssistantResponse(
          answerAr: 'بناءً على الدراسات الإكلينيكية والنشرة المعتمدة لدواء أملوديبين (نورفاسك)، فإن "الدوخة والخفة في الرأس" مسجلة كأثر جانبي محتمل بنسبة تتراوح بين 1.1% إلى 3.4% نتيجة انخفاض ضغط الدم. \n\nتنبيه طبي هام: المنصة لا تجزم بأن الدواء هو السبب الوحيد في حالتك؛ فقد تلعب عوامل أخرى كالجفاف أو تغير وضعية الجسم دوراً. \n\nيحظر تماماً إيقاف الدواء أو تغيير جرعته من تلقاء نفسك لأن التوقف المفاجئ قد يسبب ارتفاعاً حاداً في الضغط. سجل هذا العرض في سجل الأعراض واستشر صيدليك أو طبيبك المعالج.',
          answerEn: 'Based on verified clinical trials for Amlodipine (Norvasc), dizziness is an established potential side effect documented in approximately 1.1% to 3.4% of patients due to vascular resistance reduction.\n\nImportant: SALUS does not conclude that your medication is the definitive cause. Do NOT discontinue or adjust your dose independently. Record this symptom and consult your pharmacist.',
          clarifyingQuestionsAr: [
            'هل تشعر بالدوخة عند الوقوف السريع من السرير أو الكرسي؟',
            'منذ متى بدأت في تناول جرعة الأملوديبين الحالية؟',
            'هل تؤثر هذه الدوخة على اتزانك أثناء المشي أو الحركة؟',
          ],
          clarifyingQuestionsEn: [
            'Does the dizziness occur primarily when standing up quickly?',
            'When did you start your current dose of Amlodipine?',
            'Does this dizziness affect your balance or walking stability?',
          ],
          sourceTitle: 'US FDA DailyMed Prescribing Information (Norvasc SPL)',
        );
      }

      if (lower.contains('تورم') || lower.contains('ورم') || lower.contains('كاحل') || lower.contains('edema') || lower.contains('swelling')) {
        return VoiceAssistantResponse(
          answerAr: 'تورم الكاحلين والقدمين أثر جانبي معروف وموثق للأملوديبين (نورفاسك)، وتبلغ نسبته 1.8% بجرعة 2.5 مجم، وترتفع إلى 10.8% مع جرعة 10 مجم في التجارب السريرية، ويظهر عادة خلال أسبوعين إلى 6 أسابيع. \n\nتنبيه: لا توقف الدواء بنفسك؛ استشر الطبيب أو الصيدلي للنظر في تقليل الجرعة أو إضافة دواء مساعد لتقليل ارتشاح السوائل.',
          answerEn: 'Peripheral ankle edema is a documented dose-dependent side effect of Amlodipine, occurring in 1.8% at 2.5mg up to 10.8% at 10mg in clinical trials. Do not discontinue independently; consult your doctor or pharmacist.',
          clarifyingQuestionsAr: [
            'هل يزداد التورم في المساء أو بعد الوقوف والمشي لفترات طويلة؟',
            'هل تشعر بأي ألم مصاحب في الساقين؟',
          ],
          clarifyingQuestionsEn: [
            'Does the swelling worsen in the evening or after walking?',
            'Is there any localized calf pain or redness?',
          ],
          sourceTitle: 'US FDA DailyMed Norvasc SPL & Monitored Clinical Trials',
        );
      }
    }

    // 3. Paracetamol non-NSAID question
    if (lower.contains('باراسيتامول') || lower.contains('paracetamol') || lower.contains('بنادول') || lower.contains('panadol')) {
      return VoiceAssistantResponse(
        answerAr: 'الباراسيتامول (مثل بنادول وسيتال) هو مسكن مركزي وخافض حرارة آمن للمعدة، وهو ليس من مضادات الالتهاب غير الستيرويدية (Non-NSAID). الحد الأقصى الآمن للبالغين هو 4000 مجم (4 جرامات) يومياً لتجنب سمية الكبد.',
        answerEn: 'Paracetamol is a central analgesic and antipyretic. It is NOT an NSAID and does not cause stomach ulcers. The maximum safe adult dose is 4,000 mg (4 grams) daily.',
        clarifyingQuestionsAr: [
          'هل تتناول أي أدوية برد مجمعة أخرى تحتوي على الباراسيتامول؟',
        ],
        clarifyingQuestionsEn: [
          'Are you taking any multi-ingredient cold remedies containing paracetamol?',
        ],
        sourceTitle: 'FDA Drug Safety Communication & JAMA Monograph',
      );
    }

    // 4. Metformin & Stomach Upset
    if (lower.contains('ميتفورمين') || lower.contains('metformin') || lower.contains('جلوكوفاج') || lower.contains('glucophage')) {
      return VoiceAssistantResponse(
        answerAr: 'الإسهال والاضطرابات الهضمية تحدث لدى حوالي 53.2% من المرضى في بداية استخدام الميتفورمين (جلوكوفاج)، وهي تزول تدريجياً لدى أكثر من 75% من المرضى خلال 2 إلى 4 أسابيع، ويساعد تناوله في منتصف الوجبات على تقليلها.',
        answerEn: 'Diarrhea and GI upset occur in approximately 53.2% of patients starting Metformin. It is self-limiting in over 75% within 2 to 4 weeks. Taking it with meals reduces these symptoms.',
        clarifyingQuestionsAr: [
          'هل تأخذ الجرعة وسط وجبة الطعام أم على معدة فارغة؟',
        ],
        clarifyingQuestionsEn: [
          'Do you take the tablet with a full meal or on an empty stomach?',
        ],
        sourceTitle: 'FDA DailyMed Glucophage Label SPL',
      );
    }

    // Default: Strictly disclose when out of scope or unverified
    return VoiceAssistantResponse(
      answerAr: 'المعلومة دي مش متوفرة بشكل موثوق حاليًا ضمن نطاق الأدوية التسعة المفعلة في سالوس. يرجى استشارة الصيدلي أو الطبيب المعالج.',
      answerEn: 'Reliable information is not currently available within the verified 9-medication scope. Please consult your licensed pharmacist or physician.',
      clarifyingQuestionsAr: [
        'هل تود البحث عن أحد أدوية الضغط أو السكري أو المسكنات المعتمدة؟',
      ],
      clarifyingQuestionsEn: [
        'Would you like to search within our verified hypertension, diabetes, or pain relief scope?',
      ],
      sourceTitle: 'Egyptian Drug Authority (EDA) & DailyMed Scope Standard',
    );
  }
}
