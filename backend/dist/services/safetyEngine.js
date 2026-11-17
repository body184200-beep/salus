const RED_FLAG_RULES = [
    {
        id: 'rule-anaphylaxis-airway',
        category: 'Respiratory & Anaphylaxis',
        level: 'urgent_emergency',
        patternsEn: [
            /breath(ing)?\s*(difficult|short(ness)?|problem|struggl)/i,
            /short(ness)?\s*of\s*breath/i,
            /swelling\s*of\s*(face|lip|tongue|throat|mouth)/i,
            /throat\s*(tight|clos|swell)/i,
            /dyspnea/i,
            /wheezing/i,
            /stridor/i,
        ],
        patternsAr: [
            /ضيق\s*(في\s*)?التنفس/i,
            /صعوبة\s*(في\s*)?التنفس/i,
            /تورم\s*(في\s*)?(الوجه|الشفا(يف|ه)|اللسان|الحلق|الزور)/i,
            /خنقة\s*(في\s*)?الزور/i,
            /مش\s*قادر\s*اتنفس/i,
            /تزييق\s*(في\s*)?الصدر/i,
        ],
        reasonEn: 'Possible severe respiratory compromise or acute anaphylaxis/angioedema.',
        reasonAr: 'اشتباه في قصور تنفسي حاد أو حساسية مفرطة وتورم وعائي بالحلق والمسالك الهوائية.',
        recommendationEn: 'IMMEDIATE EMERGENCY ACTION: Seek emergency medical care immediately or call ambulance (Egypt: 123). Do not lie flat. If an epinephrine auto-injector was prescribed, administer it immediately.',
        recommendationAr: 'إجراء طارئ فوري: توجه إلى أقرب قسم طوارئ أو اتصل بالإسعاف فوراً (رقم الإسعاف في مصر: 123). اجلس في وضع مستقيم ولا تستلقِ.',
    },
    {
        id: 'rule-cardiac-chest-pain',
        category: 'Cardiovascular Emergency',
        level: 'urgent_emergency',
        patternsEn: [
            /chest\s*(pain|pressure|tightness|heaviness|burn|discomfort)/i,
            /pain\s*radiat(ing)?\s*to\s*(arm|jaw|back|neck)/i,
            /angina/i,
            /myocardial/i,
            /heart\s*attack/i,
        ],
        patternsAr: [
            /ألم\s*(في\s*)?(الصدر|القلب)/i,
            /وجع\s*(في\s*)?(الصدر|القلب)/i,
            /ضغط\s*أو\s*ثقل\s*(على\s*)?الصدر/i,
            /ألم\s*مسمع\s*في\s*(الكتف|الذراع|الفك|الضهر)/i,
            /ذبحة/i,
            /نغزة\s*شديدة\s*في\s*الصدر/i,
        ],
        reasonEn: 'Symptoms suggestive of acute coronary syndrome, severe angina, or myocardial ischemia.',
        reasonAr: 'أعراض قد تشير إلى متلازمة الشريان التاجي الحادة أو اشتباه نوبة قلبية أو ذبحة صدرية.',
        recommendationEn: 'CALL 123 IMMEDIATELY: Stop physical exertion immediately, rest in a seated position, and seek immediate emergency department evaluation.',
        recommendationAr: 'اتصل بالإسعاف (123) فوراً: توقف عن أي مجهود بدني واجلس بهدوء، وتوجه فوراً لأقرب مستشفى أو طوارئ قلب.',
    },
    {
        id: 'rule-syncope-unconsciousness',
        category: 'Neurological / Hemodynamic Collapse',
        level: 'urgent_emergency',
        patternsEn: [
            /faint(ing|ed)?/i,
            /syncope/i,
            /loss\s*of\s*consciousness/i,
            /passed\s*out/i,
            /blackout/i,
            /collapse/i,
        ],
        patternsAr: [
            /إغماء/i,
            /اغمى\s*عليا/i,
            /فقدان\s*(الـ)?وعي/i,
            /دخت\s*ووقعت/i,
            /فقدت\s*الوعي/i,
        ],
        reasonEn: 'Episode of syncope, severe sudden hypotension, or transient loss of consciousness.',
        reasonAr: 'حدوث إغماء أو هبوط حاد مفاجئ في الدورة الدموية أو فقدان للوعي.',
        recommendationEn: 'URGENT EVALUATION: Elevate legs while lying down. If consciousness is altered, call 123. Immediate physician assessment required to evaluate cardiac rhythm and hemodynamic stability.',
        recommendationAr: 'تقييم طارئ: استلقِ وارفع قدميك أعلى من مستوى القلب. إذا كان هناك اضطراب بالوعي اتصل بـ 123 فوراً. يلزم فحص طبي عاجل للتأكد من انتظام ضربات القلب والضغط.',
    },
    {
        id: 'rule-gi-bleeding',
        category: 'Gastrointestinal Hemorrhage',
        level: 'urgent_emergency',
        patternsEn: [
            /vomit(ing)?\s*blood/i,
            /blood\s*in\s*vomit/i,
            /coffee\s*ground\s*vomit/i,
            /black\s*(tarry)?\s*stool/i,
            /blood\s*in\s*stool/i,
            /melena/i,
            /hematemesis/i,
            /rectal\s*bleed/i,
        ],
        patternsAr: [
            /قيء\s*دم/i,
            /ترجيع\s*دم/i,
            /ترجيع\s*شبه\s*تفل\s*القهوة/i,
            /براز\s*(أسود|قطراني|مدمم)/i,
            /دم\s*في\s*(البراز|الترجيع)/i,
            /نزيف\s*(معوي|شرجي)/i,
        ],
        reasonEn: 'Signs highly suspicious of acute gastrointestinal ulceration or internal bleeding (especially with NSAID therapy).',
        reasonAr: 'علامات تشير لاحتمال حدوث قرحة نازفة أو نزيف حاد بالجهاز الهضمي (خصوصاً مع المسكنات ومضادات الالتهاب).',
        recommendationEn: 'DO NOT TAKE FURTHER NSAIDs OR ASPIRIN. Go immediately to an emergency hospital facility for urgent endoscopic and hemoglobin evaluation.',
        recommendationAr: 'أوقف فوراً أي مسكنات أو أسبرين. توجه مباشرة لقسم الطوارئ لتقييم النزيف ونسبة الهيموجلوبين وإجراء الفحوصات اللازمة.',
    },
    {
        id: 'rule-severe-hypoglycemia',
        category: 'Endocrine / Severe Hypoglycemia',
        level: 'urgent_emergency',
        patternsEn: [
            /severe\s*(hypoglycemia|low\s*sugar)/i,
            /blood\s*sugar\s*under\s*(50|60)/i,
            /tremor\s*and\s*confusion/i,
            /sweating\s*and\s*unresponsive/i,
        ],
        patternsAr: [
            /هبوط\s*(سكر\s*)?شديد/i,
            /السكر\s*أقل\s*من\s*(50|60)/i,
            /رعشة\s*مع\s*(توها|عدم\s*تركيز|تشويش)/i,
            /عرق\s*شديد\s*مع\s*إرهاق\s*شديد\s*جداً/i,
        ],
        reasonEn: 'Suspected severe acute hypoglycemia with neuroglycopenic manifestations (e.g., sulfonylurea-related).',
        reasonAr: 'اشتباه في هبوط حاد وخطير في سكر الدم مع تأثر وظائف الجهاز العصبي.',
        recommendationEn: 'TAKE FAST-ACTING CARBOHYDRATE IMMEDIATELY: Consume 15-20g of simple sugar (half glass of fruit juice or 3 sugar cubes). Recheck glucose in 15 minutes. If confused or unable to swallow, seek 123 emergency assistance immediately. NEVER administer oral liquids to an unconscious individual.',
        recommendationAr: 'تناول سكريات سريعة فوراً: اشرب نصف كوب عصير محلى أو 3 ملاعق سكر. أعد قياس السكر بعد 15 دقيقة. إذا كان المريض مشوشاً أو لا يستطيع البلع اتصل بالإسعاف (123) فوراً. يحظر إعطاء أي سوائل لشخص فاقد للوعي.',
    },
    {
        id: 'rule-overdose',
        category: 'Suspected Drug Overdose',
        level: 'urgent_emergency',
        patternsEn: [
            /overdose/i,
            /took\s*too\s*many\s*(pills|tablets|doses)/i,
            /double\s*dose\s*and\s*feeling\s*sick/i,
            /took\s*whole\s*bottle/i,
            /paracetamol\s*overdose/i,
        ],
        patternsAr: [
            /جرعة\s*(زائدة|مفرطة|كبيرة)/i,
            /أخدت\s*شريط\s*كامل/i,
            /أخدت\s*حبوب\s*كتير\s*بالغلط/i,
            /تسمم\s*دوائي/i,
        ],
        reasonEn: 'Suspected acute medication toxicity or overdose requiring immediate medical antidote evaluation.',
        reasonAr: 'اشتباه في تسمم دوائي أو تناول جرعة مفرطة تتطلب تدخلاً طبياً عاجلاً لإعطاء مضاد التسمم المناسب.',
        recommendationEn: 'CALL POISON CONTROL / EMERGENCY (Egypt: 123 or Cairo Poison Center: 02-23640003). Do NOT induce vomiting unless specifically directed by medical toxicologist. Bring the medication package to the hospital.',
        recommendationAr: 'اتصل بالطوارئ (123) أو مركز السموم فوراً (مركز سموم القصر العيني: 0223640003). لا تحاول إحداث قيء دون استشارة طبية. خذ علبة الدواء معك للمستشفى فوراً.',
    },
];
export function evaluateSymptomSafety(symptomText, notes, severity) {
    const combinedText = `${symptomText} ${notes || ''}`.trim();
    for (const rule of RED_FLAG_RULES) {
        const matchesEn = rule.patternsEn.some((regex) => regex.test(combinedText));
        const matchesAr = rule.patternsAr.some((regex) => regex.test(combinedText));
        if (matchesEn || matchesAr) {
            return {
                isCriticalAlert: true,
                alertLevel: rule.level,
                category: rule.category,
                triggerReason: matchesAr ? rule.reasonAr : rule.reasonEn,
                recommendationEn: rule.recommendationEn,
                recommendationAr: rule.recommendationAr,
                emergencyActionRequired: rule.level === 'urgent_emergency',
                emergencyNumberEgypt: '123',
                disclaimerEn: 'IMPORTANT: SALUS is an information platform and NOT an emergency service or clinical diagnostic system. If you are experiencing a life-threatening medical emergency, call 123 or go immediately to the nearest emergency department.',
                disclaimerAr: 'تنبيه أمان هام: سالوس منصة توعوية ومعلوماتية ولا تقدم تشخيصاً طبياً ولا تعتبر بديلاً عن خدمات الطوارئ. إذا كنت تواجه حالة طارئة، اتصل بالإسعاف (123) أو توجه فوراً لأقرب طوارئ مستشفى.',
            };
        }
    }
    // Check if severe general symptom marked
    if (severity === 'severe') {
        return {
            isCriticalAlert: false,
            alertLevel: 'warning_pharmacist_review',
            category: 'Severe Symptom Follow-Up',
            triggerReason: 'Symptom marked as Severe by patient.',
            recommendationEn: 'Because you have rated this symptom as SEVERE, we strongly recommend sharing this log with your pharmacist or scheduling an appointment with your prescribing physician.',
            recommendationAr: 'نظراً لأنك سجلت شدة هذا العرض بأنها "شديدة"، ننصحك بمشاركة هذا التقرير مع الصيدلي المختص أو مراجعة الطبيب المعالج لتقييم الحالة وتعديل الخطة العلاجية إن لزم.',
            emergencyActionRequired: false,
            emergencyNumberEgypt: '123',
            disclaimerEn: 'Absence of an emergency alert does not guarantee medical safety. Always consult qualified healthcare providers.',
            disclaimerAr: 'عدم ظهور تنبيه طارئ لا يعني بالضرورة سلامتك الكاملة. استشر دائماً طبيبك أو صيدك المعتمد.',
        };
    }
    // Routine symptom
    return {
        isCriticalAlert: false,
        alertLevel: 'info',
        category: 'Routine Symptom Monitoring',
        triggerReason: 'Standard symptom logging without high-risk red-flag indicators.',
        recommendationEn: 'Record your symptoms consistently to track their progression over time. You can share this history with your pharmacist during your next visit.',
        recommendationAr: 'سجّل أعراضك بانتظام لمتابعة تطورها مع الوقت. يمكنك مشاركة هذا السجل بسهولة مع الصيدلي للمتابعة الإكلينيكية.',
        emergencyActionRequired: false,
        emergencyNumberEgypt: '123',
        disclaimerEn: 'Absence of an alert does NOT mean you are entirely safe. Seek professional medical consultation if symptoms persist or worsen.',
        disclaimerAr: 'عدم وجود تنبيه طارئ لا يضمن زوال الخطر. استشر الطبيب أو الصيدلي إذا استمر العرض أو ازداد سوءاً.',
    };
}
