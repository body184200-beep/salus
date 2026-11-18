import { db } from '../db/database.js';
import { evaluateSymptomSafety } from './safetyEngine.js';

export interface AssistantResponse {
  answerTextEn: string;
  answerTextAr: string;
  detectedMedication?: {
    id: string;
    nameEn: string;
    nameAr: string;
    drugClassEn: string;
    drugClassAr: string;
    isNsaid: boolean;
  };
  detectedSymptom?: string;
  associatedAdverseEffect?: {
    nameEn: string;
    nameAr: string;
    frequencyDisplayEn: string;
    frequencyDisplayAr: string;
    studyOrLabel: string;
    sampleSize?: string;
    timeToOnsetEn: string;
    timeToOnsetAr: string;
    confidenceQuality: string;
  };
  safetyAlert?: any;
  clarifyingQuestionsEn: string[];
  clarifyingQuestionsAr: string[];
  pharmacistHandoffRecommended: boolean;
  mode: 'rag_structured_evidence' | 'out_of_scope_boundary' | 'emergency_escalation';
  sources: Array<{ title: string; url?: string; type: string }>;
  unsupportedNoticeAr?: string;
  unsupportedNoticeEn?: string;
}

export function processAssistantQuery(query: string, lang: 'ar' | 'en' = 'ar'): AssistantResponse {
  const normalizedQuery = query.toLowerCase().trim();

  // 1. First: Check for emergency red flags immediately
  const safetyEval = evaluateSymptomSafety(query);
  if (safetyEval.isCriticalAlert) {
    return {
      answerTextEn: `URGENT MEDICAL WARNING: Based on the symptoms described ("${safetyEval.triggerReason}"), immediate medical attention is required. Please call an ambulance (Egypt: 123) or proceed immediately to the nearest emergency room. ${safetyEval.recommendationEn}`,
      answerTextAr: `تحذير طبي طارئ: بناءً على الأعراض المذكورة ("${safetyEval.triggerReason}")، تلزم رعاية طبية عاجلة فوراً. يرجى الاتصال بالإسعاف (123) أو التوجه فوراً لأقرب طوارئ مستشفى. ${safetyEval.recommendationAr}`,
      safetyAlert: safetyEval,
      clarifyingQuestionsEn: [],
      clarifyingQuestionsAr: [],
      pharmacistHandoffRecommended: true,
      mode: 'emergency_escalation',
      sources: [{ title: 'Emergency Triage Protocol (Egypt MOH / 123)', type: 'Clinical Safety Rule' }],
    };
  }

  // 1.5 Check for identity / nurse query
  if (normalizedQuery.includes('مين انت') || normalizedQuery.includes('اسمك') || normalizedQuery.includes('الممرضة') || normalizedQuery.includes('nurse') || normalizedQuery.includes('شهد')) {
    return {
      answerTextEn: 'I am Nurse Shahd El-Sayed Hashem, your clinical nurse assistant at SALUS. I am here to guide you through your medications, explain potential adverse effects based on clinical trials, and help you connect with your doctor or pharmacist.',
      answerTextAr: 'أنا الممرضة شهد السيد هاشم، المساعد التمريضي الإكلينيكي في منصة سالوس. أساعدك في فهم أدويتك وشرح الآثار الجانبية بناءً على الأدلة الطبية وتسهيل التواصل مع طبيبك أو صيدليك.',
      clarifyingQuestionsEn: ['Do you have questions about a specific medication or symptom?'],
      clarifyingQuestionsAr: ['هل لديك سؤال عن دواء معين أو عرض تشعر به؟'],
      pharmacistHandoffRecommended: false,
      mode: 'rag_structured_evidence',
      sources: [{ title: 'SALUS Clinical Nursing Support Guide', type: 'Clinical Staff Protocol' }],
    };
  }

  // 2. Identify Medication from query (among the 9 active ingredients or Egyptian brands)
  const allIngredients = db.prepare('SELECT * FROM active_ingredients').all() as any[];
  const allProducts = db.prepare('SELECT p.*, a.name_en as active_name_en, a.name_ar as active_name_ar FROM medication_products p JOIN active_ingredients a ON p.active_ingredient_id = a.id').all() as any[];

  let matchedIngredient: any = null;
  let matchedProduct: any = null;

  // Search in products (e.g. Norvasc, Glucophage, Panadol, Brufen, Concor, Cataflam, etc.)
  for (const prod of allProducts) {
    const brandEn = prod.brand_name_en.toLowerCase();
    const brandAr = prod.brand_name_ar;
    if (normalizedQuery.includes(brandEn) || query.includes(brandAr)) {
      matchedProduct = prod;
      matchedIngredient = allIngredients.find((i) => i.id === prod.active_ingredient_id);
      break;
    }
  }

  // If not matched product, search active ingredients (e.g. Amlodipine, Metformin, Paracetamol, etc.)
  if (!matchedIngredient) {
    for (const ing of allIngredients) {
      const ingEn = ing.name_en.toLowerCase();
      const ingAr = ing.name_ar;
      if (normalizedQuery.includes(ingEn) || query.includes(ingAr)) {
        matchedIngredient = ing;
        break;
      }
    }
  }

  // If no medication from initial scope found:
  if (!matchedIngredient) {
    return {
      answerTextEn:
        'Reliable information is not currently available for this query within the current verified scope. SALUS currently covers 9 verified active ingredients (Amlodipine, Losartan, Bisoprolol, Metformin, Gliclazide, Empagliflozin, Paracetamol, Ibuprofen, Diclofenac). Please consult your pharmacist or prescribing doctor for medications outside this scope.',
      answerTextAr:
        'المعلومة دي مش متوفرة بشكل موثوق حاليًا ضمن نطاق الأدوية المفعل في سالوس. المنصة تغطي حالياً 9 مواد فعالة موثقة (أملوديبين، لوسارتان، بيسوبرولول، ميتفورمين، جليكلازيد، إمباجليفلوزين، باراسيتامول، إيبوبروفين، ديكلوفيناك). يرجى استشارة الصيدلي أو الطبيب لأي استفسار آخر.',
      unsupportedNoticeEn: 'Reliable information is not currently available.',
      unsupportedNoticeAr: 'المعلومة دي مش متوفرة بشكل موثوق حاليًا.',
      clarifyingQuestionsEn: [
        'Are you asking about a specific medication for blood pressure, diabetes, or pain relief?',
        'Would you like to search by the Egyptian brand name?',
      ],
      clarifyingQuestionsAr: [
        'هل تسأل عن دواء معين لضغط الدم، السكري، أو تسكين الألم؟',
        'هل تود البحث بالاسم التجاري المسجل في مصر؟',
      ],
      pharmacistHandoffRecommended: true,
      mode: 'out_of_scope_boundary',
      sources: [{ title: 'Egyptian Drug Authority (EDA) Scope Registry', type: 'Regulatory Scope' }],
    };
  }

  // 3. Medication is identified! Now retrieve adverse effects evidence for this ingredient
  const adverseEffects = db.prepare('SELECT * FROM adverse_effects WHERE active_ingredient_id = ?').all(matchedIngredient.id) as any[];

  // Detect common symptoms in query: dizziness (دوخة), swelling/edema (تورم / انتفاخ), diarrhea (إسهال), nausea (غثيان / ترجيع), fatigue (تعب / إرهاق), stomach pain (ألم بالمعدة / حموضة / مغص), etc.
  let matchedEffect: any = null;
  const symptomKeywords: Record<string, string[]> = {
    edema: ['تورم', 'ورم', 'انتفاخ', 'كاحل', 'رجل', 'swelling', 'edema', 'swollen', 'feet', 'ankle'],
    dizziness: ['دوخة', 'دوار', 'دايخ', 'خفة', 'dizz', 'lighthead', 'spinning'],
    diarrhea: ['إسهال', 'اسهال', 'مغص', 'تلبك', 'diarrhea', 'loose stool', 'stomach ache'],
    nausea: ['غثيان', 'لوعة', 'نفسي غامة', 'nausea', 'vomit', 'upset stomach'],
    fatigue: ['تعب', 'إرهاق', 'خمول', 'كسل', 'fatigue', 'tired', 'weakness'],
    dyspepsia: ['حموضة', 'حرقان', 'معدة', 'فم المعدة', 'heartburn', 'dyspepsia', 'stomach burn'],
    hypoglycemia: ['هبوط سكر', 'رعشة', 'عرق بارد', 'جوع شديد', 'low sugar', 'hypoglycemia', 'sweat', 'shaky'],
    flushing: ['سخونة', 'احمرار', 'توهج', 'flushing', 'warmth', 'red face'],
    mycotic: ['حكة', 'فطريات', 'إفرازات', 'yeast', 'itch', 'fungal'],
    polyuria: ['تبول كتير', 'حمام كتير', 'بول', 'urination', 'frequent urine', 'pee'],
  };

  for (const [key, keywords] of Object.entries(symptomKeywords)) {
    if (keywords.some((k) => normalizedQuery.includes(k) || query.includes(k))) {
      // Find matching adverse effect
      matchedEffect = adverseEffects.find((ae) => {
        const nameLower = ae.name_en.toLowerCase();
        return (
          (key === 'edema' && nameLower.includes('edema')) ||
          (key === 'dizziness' && nameLower.includes('dizziness')) ||
          (key === 'diarrhea' && nameLower.includes('diarrhea')) ||
          (key === 'nausea' && nameLower.includes('nausea')) ||
          (key === 'fatigue' && nameLower.includes('fatigue')) ||
          (key === 'dyspepsia' && nameLower.includes('dyspepsia')) ||
          (key === 'hypoglycemia' && nameLower.includes('hypoglycemia')) ||
          (key === 'flushing' && nameLower.includes('flushing')) ||
          (key === 'mycotic' && nameLower.includes('mycotic')) ||
          (key === 'polyuria' && nameLower.includes('urination'))
        );
      });
      if (matchedEffect) break;
    }
  }

  // Build plain-language, evidence-backed answer:
  let answerEn = '';
  let answerAr = '';
  const clarifyingQuestionsEn: string[] = [];
  const clarifyingQuestionsAr: string[] = [];

  const medDisplayNameEn = matchedProduct ? `${matchedProduct.brand_name_en} (${matchedIngredient.name_en})` : matchedIngredient.name_en;
  const medDisplayNameAr = matchedProduct ? `${matchedProduct.brand_name_ar} (${matchedIngredient.name_ar})` : matchedIngredient.name_ar;

  if (matchedEffect) {
    answerEn =
      `Based on verified clinical evidence and product labeling for ${medDisplayNameEn}, "${matchedEffect.name_en}" is an established potential side effect. In clinical trials, this was documented in approximately ${matchedEffect.frequency_display_en} (Source: ${matchedEffect.source_study_or_label}). ` +
      `Typically, time to onset is: "${matchedEffect.time_to_onset_en}". ` +
      `Important: While this symptom is known to be associated with ${matchedIngredient.name_en}, SALUS does not conclude that your medication is the definitive cause in your personal case. Other medical factors, hydration, or concurrent conditions may play a role. ` +
      `DO NOT stop or change your medication dosage on your own. Sudden discontinuation can be hazardous. Please record this symptom in your SALUS log and discuss it with your pharmacist or doctor.`;

    answerAr =
      `بناءً على الدراسات الإكلينيكية والنشرات المعتمدة لدواء ${medDisplayNameAr}، فإن "${matchedEffect.name_ar}" يُعد من الآثار الجانبية المحتملة والمعروفة طبياً لهذا الدواء. في التجارب السريرية، سُجل هذا العرض بنسبة ${matchedEffect.frequency_display_ar} (المصدر: ${matchedEffect.source_study_or_label}). ` +
      `وعادةً ما يكون وقت بدء الظهور: "${matchedEffect.time_to_onset_ar}". ` +
      `تنبيه طبي هام: على الرغم من أن هذا العرض مرتبط علمياً بالدواء، إلا أن منصة سالوس لا تؤكد ولا تجزم بأن الدواء هو السبب الوحيد في حالتك الشخصية؛ فقد تكون هناك عوامل أخرى أو أدوية متزامنة. ` +
      `يحظر تماماً إيقاف الدواء أو تعديل جرعته من تلقاء نفسك، لأن التوقف المفاجئ قد يسبب مضاعفات خطيرة. ننصحك بتسجيل هذا العرض في سجل الأعراض ومشاركته مع الصيدلي لمراجعته طبياً.`;

    clarifyingQuestionsEn.push('How long after taking your medication did you first notice this symptom?');
    clarifyingQuestionsEn.push('Does this symptom interfere with your daily activities, walking, or balance?');
    clarifyingQuestionsEn.push('Are you taking any other prescription or over-the-counter medications?');

    clarifyingQuestionsAr.push('منذ متى بدأت تلاحظ هذا العرض بعد أخذ الدواء؟');
    clarifyingQuestionsAr.push('هل يؤثر هذا العرض على قدرتك على الحركة، المشي، أو الاتزان اليومي؟');
    clarifyingQuestionsAr.push('هل تتناول أي أدوية أو مسكنات أخرى في نفس الفترة؟');
  } else {
    // General medication overview
    answerEn =
      `${medDisplayNameEn} belongs to the class of ${matchedIngredient.drug_class_en}. ` +
      `It is prescribed for: ${matchedIngredient.general_purpose_en} ` +
      `Key safety warning: ${matchedIngredient.warnings_en} ` +
      `If you are experiencing any unlisted symptoms, log them in your SALUS symptom tracker to review them with your pharmacist.`;

    answerAr =
      `دواء ${medDisplayNameAr} ينتمي لمجموعة ${matchedIngredient.drug_class_ar}. ` +
      `يستخدم طبياً لـ: ${matchedIngredient.general_purpose_ar} ` +
      `تنبيه أمان هام: ${matchedIngredient.warnings_ar} ` +
      `إذا كنت تشعر بأي عرض جانبي، يمكنك تسجيله الآن في سجل الأعراض وسيقوم الصيدلي بمراجعته معك.`;

    clarifyingQuestionsEn.push('Would you like to know about the most common documented side effects for this medicine?');
    clarifyingQuestionsEn.push('Do you want to log a specific symptom you are experiencing right now?');

    clarifyingQuestionsAr.push('هل تود معرفة أكثر الآثار الجانبية الموثقة انتشاراً لهذا الدواء؟');
    clarifyingQuestionsAr.push('هل تريد تسجيل عرض معين تشعر به حالياً لمشاركته مع الصيدلي؟');
  }

  // Ensure Paracetamol is clearly noted as non-NSAID
  if (matchedIngredient.id === 'ing-paracetamol') {
    answerEn += ' (Medical note: Paracetamol is a central analgesic and is NOT an NSAID).';
    answerAr += ' (ملاحظة طبية: الباراسيتامول مسكن مركزي وليس من مضادات الالتهاب غير الستيرويدية).';
  }

  return {
    answerTextEn: answerEn,
    answerTextAr: answerAr,
    detectedMedication: {
      id: matchedIngredient.id,
      nameEn: matchedIngredient.name_en,
      nameAr: matchedIngredient.name_ar,
      drugClassEn: matchedIngredient.drug_class_en,
      drugClassAr: matchedIngredient.drug_class_ar,
      isNsaid: matchedIngredient.is_nsaid === 1,
    },
    detectedSymptom: matchedEffect ? matchedEffect.name_en : undefined,
    associatedAdverseEffect: matchedEffect
      ? {
          nameEn: matchedEffect.name_en,
          nameAr: matchedEffect.name_ar,
          frequencyDisplayEn: matchedEffect.frequency_display_en,
          frequencyDisplayAr: matchedEffect.frequency_display_ar,
          studyOrLabel: matchedEffect.source_study_or_label,
          sampleSize: matchedEffect.sample_size_denominator || undefined,
          timeToOnsetEn: matchedEffect.time_to_onset_en,
          timeToOnsetAr: matchedEffect.time_to_onset_ar,
          confidenceQuality: matchedEffect.confidence_evidence_quality,
        }
      : undefined,
    clarifyingQuestionsEn,
    clarifyingQuestionsAr,
    pharmacistHandoffRecommended: true,
    mode: 'rag_structured_evidence',
    sources: [
      {
        title: matchedEffect ? matchedEffect.source_study_or_label : 'FDA DailyMed & Egyptian Drug Authority (EDA)',
        type: 'Verified Clinical Trial & Official Drug Labeling',
      },
      {
        title: 'SALUS Clinical Pharmacy Verified Database (2026)',
        type: 'Evidence Monograph',
      },
    ],
  };
}
