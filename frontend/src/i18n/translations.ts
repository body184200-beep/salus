export type Language = 'ar' | 'en';

export const translations = {
  ar: {
    // Brand & General
    brandName: 'سالوس',
    brandTagline: 'افهم دواءك. خليك في أمان.',
    heroHeadline: 'افهم دواءك. سجّل أعراضك. وخليك على تواصل مع الصيدلي.',
    heroSubtitle: 'منصة ذكية موثوقة لمساعدة المرضى على فهم أدويتهم ورصد الآثار الجانبية ومشاركة سجلاتهم الصحية مع الصيدلي بطريقة آمنة.',
    getStarted: 'ابدأ الآن',
    imPharmacist: 'أنا صيدلي',
    learnMore: 'تعرف على سالوس',
    languageName: 'English',
    
    // Nav
    navHome: 'الرئيسية',
    navSearch: 'بحث الأدوية',
    navScan: 'مسح العبوة (كاميرا)',
    navVoice: 'المساعد الصوتي',
    navSymptoms: 'متابعة الأعراض',
    navMyMeds: 'أدويتي',
    navReports: 'تقاريري الطبية',
    navPharmacist: 'التواصل مع الصيدلي',
    navSettings: 'الإعدادات',
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب جديد',
    logout: 'تسجيل الخروج',
    demoAccounts: 'حسابات تجريبية سريعة',
    demoPatient: 'مريض: أحمد حسن',
    demoDoctor: 'طبيب معتمد: د. محمد طارق',
    demoNurse: 'د. سمر السيد محمد هاشم (صيدلية إكلينيكية)',
    demoDoctorShahd: 'د. سمر السيد محمد هاشم (صيدلية إكلينيكية)',
    demoSamar: 'د. سمر السيد محمد هاشم (صيدلية إكلينيكية)',
    demoPharmVerified: 'صيدلي مرخص: د. مريم فاروق',
    demoPharmPending: 'صيدلي قيد المراجعة: د. كريم زكي',
    nurseShahdTitle: 'د. سمر السيد محمد هاشم',
    
    // Safety & Philosophy
    criticalDisclaimerTitle: 'إخلاء مسؤولية طبي هام',
    criticalDisclaimer: 'سالوس منصة توعوية ومساعدة ولا تقدم تشخيصاً طبياً ولا تعتبر بديلاً عن الطبيب أو الصيدلي. لا توقف أو تغير جرعة دوائك بنفسك أبداً.',
    emergencyAlertTitle: 'تحذير طبي طارئ',
    callAmbulance: 'اتصل بالإسعاف فوراً (123)',
    emergencyText: 'أعراضك تستدعي تدخلاً طبياً عاجلاً. توجه إلى أقرب قسم طوارئ.',
    unsupportedNotice: 'المعلومة دي مش متوفرة بشكل موثوق حاليًا.',
    
    // Categories
    catHypertension: 'أدوية ضغط الدم',
    catDiabetes: 'أدوية السكري',
    catPain: 'مسكنات الألم ومضادات الالتهاب',
    nonNsaidBadge: 'مسكن مركزي - ليس مضاد التهاب ستيرويدي (Non-NSAID)',
    nsaidBadge: 'مضاد التهاب غير ستيرويدي (NSAID)',
    
    // Features
    featureSearchTitle: 'بحث موثق في الأدوية',
    featureSearchDesc: 'استعرض المواد الفعالة والأسماء التجارية المسجلة في مصر، مع نسب الآثار الجانبية الحقيقية من النشرات والتجارب الإكلينيكية دون أرقام وهمية.',
    featureScanTitle: 'مسح عبوة الدواء بالكاميرا',
    featureScanDesc: 'التقط صورة علبة الدواء أو الشريط لاستخراج الاسم والتركيز، مع تأكيد بشري إلزامي لضمان أمانك.',
    featureVoiceTitle: 'مساعد صوتي باللهجة المصرية',
    featureVoiceDesc: 'تحدث بالعامية المصرية واسأل عن الأعراض والأدوية بصوت واضح واستمع للإجابة فوراً.',
    featureSymptomTitle: 'رصد الأعراض وتأثير الحركة',
    featureSymptomDesc: 'سجل الأعراض وشدتها وتأثيرها على الاتزان، المشي، والإجهاد البدني (تكامل العلاج الطبيعي).',
    featurePharmacistTitle: 'ربط مباشر وموثق بالصيدلي',
    featurePharmacistDesc: 'شارك بياناتك بكود سري مؤقت وتحكم في الصلاحيات بإمكانية إلغائها فوراً في أي وقت.',
    
    // Pharmacist Dashboard
    pharmTitle: 'لوحة التحكم المهنية للصيدلي',
    pharmVerifiedBadge: 'صيدلي معتمد من نقابة الصيادلة',
    pharmPendingBadge: 'الحساب قيد التحقق المهني',
    pharmEnterCode: 'أدخل كود مشاركة المريض (SALUS-XXXX-XXXX)',
    pharmConnectBtn: 'ربط ملف المريض',
    pharmActiveCases: 'حالات المتابعة الإكلينيكية النشطة',
    pharmNoCases: 'لا توجد حالات متابعة نشطة حالياً. اطلب من المريض كود المشاركة.',
    pharmReviewBtn: 'مراجعة الحالة السريرية',
    pharmWriteNote: 'تسجيل التوصية والملاحظة الإكلينيكية',
    pharmCompleteFollowUp: 'إتمام المتابعة',
    
    // Patient Symptom Log
    logSymptomTitle: 'تسجيل عرض جديد',
    symptomNameLabel: 'اسم العرض أو الشكوى',
    symptomNamePlaceholder: 'مثال: تورم في الكاحل، دوخة عند الوقوف، إسهال...',
    severityLabel: 'درجة الشدة',
    severityMild: 'خفيفة (Mild)',
    severityModerate: 'متوسطة (Moderate)',
    severitySevere: 'شديدة (Severe)',
    mobilityImpactTitle: 'التأثير على الحركة والوظائف اليومية (ملاحظات العلاج الطبيعي)',
    impactActivities: 'يؤثر على ممارسة الأنشطة اليومية',
    impactBalance: 'يؤثر على الاتزان والثبات',
    impactWalking: 'يؤثر على القدرة على المشي',
    impactMobility: 'يحد من حركة المفاصل أو الجسم',
    impactFatigue: 'يسبب إرهاقاً سريعاً عند المجهود',
    ongoingLabel: 'العرض مستمر حتى الآن',
    notesLabel: 'ملاحظات إضافية للمريض',
    saveSymptomBtn: 'حفظ وتدقيق الأمان',
    
    // Reports
    downloadPdfReport: 'تحميل التقرير الطبي الشامل (PDF)',
    printReport: 'طباعة التقرير',
    
    // Consent
    generateInviteTitle: 'إنشاء كود مشاركة للصيدلي',
    generateInviteBtn: 'إنشاء كود جديد آمن',
    activeGrantsTitle: 'أكواد المشاركة والصلاحيات الحالية',
    revokeAccessBtn: 'إلغاء الصلاحية فوراً',
    
    // SDGs
    sdgTitle: 'التوافق مع أهداف التنمية المستدامة (SDGs)',
    sdg3: 'الهدف 3: الصحة الجيدة والرفاه - الحد من المضاعفات الدوائية والتسمم غير المقصود.',
    sdg9: 'الهدف 9: الصناعة والابتكار والهياكل الأساسية - بنية تكنولوجية صحية متقدمة في مصر.',
    sdg10: 'الهدف 10: الحد من أوجه عدم المساواة - تمكين كبار السن ومحدودي القراءة عبر الصوت والبساطة.',
  },
  en: {
    // Brand & General
    brandName: 'SALUS',
    brandTagline: 'Know Your Medicine. Stay Safer.',
    heroHeadline: 'Understand Your Medicine. Track Your Symptoms. Stay Connected.',
    heroSubtitle: 'An evidence-backed healthcare platform helping patients understand medication risks, track adverse symptoms, and securely consult licensed pharmacists.',
    getStarted: 'Get Started',
    imPharmacist: "I'm a Pharmacist",
    learnMore: 'Learn More',
    languageName: 'العربية',
    
    // Nav
    navHome: 'Home',
    navSearch: 'Search Medicine',
    navScan: 'Scan Packaging (OCR)',
    navVoice: 'Voice Assistant',
    navSymptoms: 'Track Symptoms',
    navMyMeds: 'My Medications',
    navReports: 'My Reports',
    navPharmacist: 'Connect with Pharmacist',
    navSettings: 'Settings',
    login: 'Sign In',
    register: 'Create Account',
    logout: 'Sign Out',
    demoAccounts: 'Quick Demo Accounts',
    demoPatient: 'Patient: Ahmed Hassan',
    demoDoctor: 'Doctor: Dr. Mohamed Tarek',
    demoNurse: 'Clinical Pharmacist: Dr. Samar Alsayed Mohamed Hashem',
    demoDoctorShahd: 'Clinical Pharmacist: Dr. Samar Alsayed Mohamed Hashem',
    demoSamar: 'Clinical Pharmacist: Dr. Samar Alsayed Mohamed Hashem',
    demoPharmVerified: 'Verified Pharmacist: Dr. Mariam Farouk',
    demoPharmPending: 'Pending Pharmacist: Dr. Karim Zaki',
    nurseShahdTitle: 'Dr. Samar Alsayed Mohamed Hashem (Clinical Pharmacist)',
    
    // Safety & Philosophy
    criticalDisclaimerTitle: 'Critical Medical Disclaimer',
    criticalDisclaimer: 'SALUS is an informational educational platform. It does NOT provide clinical diagnoses or replace physicians and pharmacists. Never discontinue or adjust prescription dosages independently.',
    emergencyAlertTitle: 'Emergency Medical Alert',
    callAmbulance: 'Call Ambulance Immediately (Egypt: 123)',
    emergencyText: 'Your reported symptoms require urgent clinical evaluation. Proceed to the nearest emergency department.',
    unsupportedNotice: 'Reliable information is not currently available.',
    
    // Categories
    catHypertension: 'Hypertension Medications',
    catDiabetes: 'Diabetes Medications',
    catPain: 'Pain Relief & NSAIDs',
    nonNsaidBadge: 'Central Analgesic - NOT an NSAID',
    nsaidBadge: 'Nonsteroidal Anti-inflammatory Drug (NSAID)',
    
    // Features
    featureSearchTitle: 'Evidence-Backed Search',
    featureSearchDesc: 'Search 9 initial active ingredients and verified Egyptian registered brands with exact trial incidence rates—no fabricated percentages.',
    featureScanTitle: 'Camera Package Scanning (OCR)',
    featureScanDesc: 'Capture packaging or blister packs to detect active ingredient and strength, with mandatory patient confirmation.',
    featureVoiceTitle: 'Egyptian Arabic & English Voice',
    featureVoiceDesc: 'Natural speech recognition and text-to-speech built for older adults and accessibility.',
    featureSymptomTitle: 'Symptom & Mobility Tracker',
    featureSymptomDesc: 'Record severity alongside physiotherapy markers: impact on balance, walking, exertion fatigue, and mobility.',
    featurePharmacistTitle: 'Consent-Based Pharmacist Link',
    featurePharmacistDesc: 'Share your records via short-lived encrypted invitation tokens with immediate patient revocation control.',
    
    // Pharmacist Dashboard
    pharmTitle: 'Pharmacist Professional Clinical Dashboard',
    pharmVerifiedBadge: 'Syndicate-Verified Licensed Pharmacist',
    pharmPendingBadge: 'Syndicate Verification Pending',
    pharmEnterCode: 'Enter Patient Share Code (SALUS-XXXX-XXXX)',
    pharmConnectBtn: 'Connect Patient Record',
    pharmActiveCases: 'Active Clinical Follow-Up Cases',
    pharmNoCases: 'No active patient cases. Request an invitation code from the patient.',
    pharmReviewBtn: 'Review Case Records',
    pharmWriteNote: 'Record Pharmacist Clinical Note',
    pharmCompleteFollowUp: 'Complete Follow-Up',
    
    // Patient Symptom Log
    logSymptomTitle: 'Log New Symptom',
    symptomNameLabel: 'Symptom Description',
    symptomNamePlaceholder: 'e.g., Ankle swelling, lightheadedness on standing, stomach cramps...',
    severityLabel: 'Severity Level',
    severityMild: 'Mild',
    severityModerate: 'Moderate',
    severitySevere: 'Severe',
    mobilityImpactTitle: 'Mobility & Functional Impact (Physiotherapy Markers)',
    impactActivities: 'Affects daily routine activities',
    impactBalance: 'Affects balance and stability',
    impactWalking: 'Affects walking or gait',
    impactMobility: 'Limits joint or physical mobility',
    impactFatigue: 'Causes rapid fatigue during exertion',
    ongoingLabel: 'Symptom is currently ongoing',
    notesLabel: 'Additional Patient Observations',
    saveSymptomBtn: 'Save & Verify Safety',
    
    // Reports
    downloadPdfReport: 'Download Comprehensive PDF Report',
    printReport: 'Print Report',
    
    // Consent
    generateInviteTitle: 'Generate Pharmacist Share Code',
    generateInviteBtn: 'Create Secure Invitation Token',
    activeGrantsTitle: 'Active Consents & Access Tokens',
    revokeAccessBtn: 'Revoke Access Immediately',
    
    // SDGs
    sdgTitle: 'Sustainable Development Goals (SDG) Alignment',
    sdg3: 'SDG 3: Good Health & Well-being - Mitigate preventable adverse drug events and toxicities.',
    sdg9: 'SDG 9: Industry, Innovation & Infrastructure - Modern healthcare technology infrastructure in Egypt.',
    sdg10: 'SDG 10: Reduced Inequalities - Empower older adults and low-literacy users through voice and visual clarity.',
  },
};
