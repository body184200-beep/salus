import React from 'react';
import {
  Shield,
  Search,
  Camera,
  Mic,
  Activity,
  UserCheck,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Heart,
  Scale,
  Brain,
  Layers,
  Lock,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';
import { useAuth } from '../context/AuthContext.js';

interface LandingPageProps {
  onNavigate: (view: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { t, language, isRtl } = useLanguage();
  const { isAuthenticated, user, loginAsDemoPatient, loginAsDemoPharmacist } = useAuth();

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Soft background ambient gradients */}
        <div className="absolute top-0 start-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-salus-light-mint/60 via-transparent to-transparent blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-salus-light-mint border border-salus-teal/20 text-salus-dark-teal text-xs font-bold mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-salus-teal" />
            <span>
              {language === 'ar'
                ? 'أمان دوائي مدعوم بالذكاء الاصطناعي والأدلة الإكلينيكية • مصر'
                : 'Evidence-Backed AI Medication Safety • Egypt'}
            </span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-salus-dark-teal tracking-tight leading-[1.2] max-w-4xl mx-auto mb-6">
            {t('heroHeadline')}
          </h1>

          {/* Supporting text */}
          <p className="text-lg sm:text-xl text-salus-muted max-w-2xl mx-auto leading-relaxed mb-10">
            {t('heroSubtitle')}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <button
              onClick={() => {
                if (isAuthenticated) {
                  onNavigate(user?.role === 'pharmacist' ? 'pharmacist' : 'patient');
                } else {
                  loginAsDemoPatient();
                  onNavigate('patient');
                }
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-salus-teal text-white font-bold text-base shadow-xl shadow-salus-teal/30 hover:bg-salus-dark-teal transition-all flex items-center justify-center gap-2 group"
            >
              <span>{t('getStarted')}</span>
              <ArrowIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => {
                loginAsDemoPharmacist();
                onNavigate('pharmacist');
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-salus-dark-teal border-2 border-salus-teal/30 font-bold text-base hover:bg-salus-light-mint/50 transition-all flex items-center justify-center gap-2"
            >
              <UserCheck className="w-5 h-5 text-salus-teal" />
              <span>{t('imPharmacist')}</span>
            </button>
          </div>

          {/* Core Safety Micro-Notice */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-salus-muted font-medium">
            <Lock className="w-3.5 h-3.5 text-salus-teal" />
            <span>
              {language === 'ar'
                ? 'بياناتك ملكك بالكامل. مشاركة مشروطة بموافقتك مع إمكانية الإلغاء الفوري.'
                : 'Patient-owned health records. Consent-based sharing with instant revocation.'}
            </span>
          </div>
        </div>
      </section>

      {/* 2. HOW SALUS WORKS (3-Step Journey) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-salus-dark-teal mb-4">
            {language === 'ar' ? 'كيف يعمل سالوس لحمايتك؟' : 'How SALUS Protects You'}
          </h2>
          <p className="text-salus-muted text-sm sm:text-base">
            {language === 'ar'
              ? 'رحلة متكاملة صُممت لتناسب جميع الفئات العمرية مع التركيز على سهولة الاستخدام والصوت.'
              : 'A seamless journey designed for high accessibility, voice interaction, and clinical safety.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative">
            <div className="w-14 h-14 rounded-2xl bg-salus-light-mint flex items-center justify-center text-salus-teal font-black text-xl mb-6">
              1
            </div>
            <h3 className="text-xl font-bold text-salus-dark-teal mb-3">
              {language === 'ar' ? 'ابحث أو صوّر علبة الدواء' : 'Search or Scan Package'}
            </h3>
            <p className="text-salus-muted text-sm leading-relaxed">
              {language === 'ar'
                ? 'استخدم الصوت، الكتابة، أو كاميرا الهاتف لمسح العبوة. سيتعرف سالوس على الدواء والتركيز ويطلب منك التأكيد لضمان الدقة.'
                : 'Use Egyptian voice, text search, or your phone camera to scan packaging. Confirmed matching prevents mistaken drug identity.'}
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-xl mb-6">
              2
            </div>
            <h3 className="text-xl font-bold text-salus-dark-teal mb-3">
              {language === 'ar' ? 'افهم الأعراض وسجّلها' : 'Understand & Track Symptoms'}
            </h3>
            <p className="text-salus-muted text-sm leading-relaxed">
              {language === 'ar'
                ? 'تعرف على الآثار الجانبية ونسبها الحقيقية من التجارب الإكلينيكية. سجّل ما تشعر به وتأثيره على حركتك واتزانك ومجهودك.'
                : 'Review genuine trial incidence percentages (no invented numbers). Record symptoms and their impact on gait, balance, and mobility.'}
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative">
            <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center text-salus-dark-teal font-black text-xl mb-6">
              3
            </div>
            <h3 className="text-xl font-bold text-salus-dark-teal mb-3">
              {language === 'ar' ? 'تواصل مع الصيدلي المرخص' : 'Connect with Your Pharmacist'}
            </h3>
            <p className="text-salus-muted text-sm leading-relaxed">
              {language === 'ar'
                ? 'أنشئ كود مشاركة سري مؤقت ليقوم الصيدلي بفحص الأعراض وتسجيل توجيه إكلينيكي في ملفك دون المساس بخصوصيتك.'
                : 'Generate a short-lived secure token for your pharmacist to review authorized records and provide verified clinical follow-up.'}
            </p>
          </div>
        </div>
      </section>

      {/* 3. INITIAL MEDICATION SCOPE (3 Categories, 9 Ingredients) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-salus-light-mint/40 via-white to-salus-light-mint/20 rounded-3xl p-8 sm:p-12 border border-salus-teal/20">
          <div className="max-w-3xl mb-10">
            <div className="inline-block px-3 py-1 rounded-lg bg-salus-teal text-white text-xs font-bold uppercase tracking-wider mb-3">
              {language === 'ar' ? 'النطاق الدوائي الأولي الموثق' : 'Initial Verified Medication Scope'}
            </div>
            <h2 className="text-3xl font-extrabold text-salus-dark-teal mb-3">
              {language === 'ar' ? '3 مجموعات علاجية و 9 مواد فعالة مسجلة في مصر' : '3 Therapeutic Categories & 9 Active Ingredients'}
            </h2>
            <p className="text-salus-muted text-sm sm:text-base leading-relaxed">
              {language === 'ar'
                ? 'قاعدة بيانات دوائية مدققة سريرياً ومربوطة بالأسماء التجارية المسجلة في هيئة الدواء المصرية (EDA) وقاعدة بيانات DailyMed العالمية.'
                : 'Clinically audited drug knowledge mapped to EDA Egyptian registered trade names and NLM DailyMed trial labels.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Category A */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/70 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-5 h-5 text-rose-500" />
                <h3 className="font-black text-salus-dark-teal text-lg">{t('catHypertension')}</h3>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="p-2.5 rounded-xl bg-salus-bg flex flex-col">
                  <span className="font-bold text-salus-text">أملوديبين (Amlodipine)</span>
                  <span className="text-xs text-salus-muted">نورفاسك، أملور، فاسكالفا</span>
                </li>
                <li className="p-2.5 rounded-xl bg-salus-bg flex flex-col">
                  <span className="font-bold text-salus-text">لوسارتان (Losartan)</span>
                  <span className="text-xs text-salus-muted">كوزار، سورتيفا، لوسابريس</span>
                </li>
                <li className="p-2.5 rounded-xl bg-salus-bg flex flex-col">
                  <span className="font-bold text-salus-text">بيسوبرولول (Bisoprolol)</span>
                  <span className="text-xs text-salus-muted">كونكور، بيسوكارد، لودوز</span>
                </li>
              </ul>
            </div>

            {/* Category B */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/70 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-5 h-5 text-sky-500" />
                <h3 className="font-black text-salus-dark-teal text-lg">{t('catDiabetes')}</h3>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="p-2.5 rounded-xl bg-salus-bg flex flex-col">
                  <span className="font-bold text-salus-text">ميتفورمين (Metformin)</span>
                  <span className="text-xs text-salus-muted">جلوكوفاج، سيدوفاج، جلوفان</span>
                </li>
                <li className="p-2.5 rounded-xl bg-salus-bg flex flex-col">
                  <span className="font-bold text-salus-text">جليكلازيد (Gliclazide)</span>
                  <span className="text-xs text-salus-muted">دياميكرون إم آر، دياكلازيد</span>
                </li>
                <li className="p-2.5 rounded-xl bg-salus-bg flex flex-col">
                  <span className="font-bold text-salus-text">إمباجليفلوزين (Empagliflozin)</span>
                  <span className="text-xs text-salus-muted">جارديانس، إمباكير</span>
                </li>
              </ul>
            </div>

            {/* Category C */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/70 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Scale className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-salus-dark-teal text-lg">{t('catPain')}</h3>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-salus-text">باراسيتامول (Paracetamol)</span>
                    <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-md">Non-NSAID</span>
                  </div>
                  <span className="text-xs text-salus-muted mt-1">بنادول، سيتال، بارامول، أبيمول</span>
                </li>
                <li className="p-2.5 rounded-xl bg-salus-bg flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-salus-text">إيبوبروفين (Ibuprofen)</span>
                    <span className="text-[10px] font-bold bg-amber-600 text-white px-2 py-0.5 rounded-md">NSAID</span>
                  </div>
                  <span className="text-xs text-salus-muted mt-1">بروفين، أدفيل، ماركوفين</span>
                </li>
                <li className="p-2.5 rounded-xl bg-salus-bg flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-salus-text">ديكلوفيناك (Diclofenac)</span>
                    <span className="text-[10px] font-bold bg-amber-600 text-white px-2 py-0.5 rounded-md">NSAID</span>
                  </div>
                  <span className="text-xs text-salus-muted mt-1">فولتارين، كتافلام، دولفين</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PHYSIOTHERAPY & BIOTECHNOLOGY INTEGRATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Physiotherapy Card */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-salus-teal mb-6">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-salus-dark-teal mb-3">
                {language === 'ar' ? 'تكامل العلاج الطبيعي والحركي' : 'Physiotherapy & Mobility Integration'}
              </h3>
              <p className="text-salus-muted text-sm leading-relaxed mb-6">
                {language === 'ar'
                  ? 'العديد من الأدوية تؤثر مباشرة على الاتزان، المشي، وتورم القدمين (مثل الأملوديبين وحاصرات بيتا). يتيح سالوس للمريض رصد مدى تأثير العرض على اتزانه اليومي وقدرته على الحركة والإجهاد السريع لتوفير صورة سريرية شاملة للفريق الطبي.'
                  : 'Many medications influence gait, balance, and lower extremity edema (e.g., Amlodipine, Beta-blockers). SALUS lets patients observe functional impact without making clinical diagnoses.'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-salus-dark-teal">
              <div className="bg-salus-bg p-3 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-salus-teal" />
                <span>{language === 'ar' ? 'رصد الاتزان والثبات' : 'Balance Tracking'}</span>
              </div>
              <div className="bg-salus-bg p-3 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-salus-teal" />
                <span>{language === 'ar' ? 'القدرة على المشي' : 'Walking & Gait'}</span>
              </div>
              <div className="bg-salus-bg p-3 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-salus-teal" />
                <span>{language === 'ar' ? 'حركة المفاصل والأطراف' : 'Joint Mobility'}</span>
              </div>
              <div className="bg-salus-bg p-3 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-salus-teal" />
                <span>{language === 'ar' ? 'إجهاد المجهود البدني' : 'Exertion Fatigue'}</span>
              </div>
            </div>
          </div>

          {/* Evidence & Biotechnology Card */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 mb-6">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-salus-dark-teal mb-3">
                {language === 'ar' ? 'الشفافية الطبية وهندسة التقنية الحيوية' : 'Evidence-Based Biotechnology'}
              </h3>
              <p className="text-salus-muted text-sm leading-relaxed mb-6">
                {language === 'ar'
                  ? 'لا نبتكر أرقاماً ولا نخمن الآثار الجانبية. كل نسبة معروضة في سالوس مستندة إلى دراسة سريرية منشورة مع توضيح حجم العينة والدواء المقارن ووقت البدء. وفي حال عدم توفر المعلومة يعلن سالوس ذلك بكل شفافية.'
                  : 'Zero invented percentages. Every statistic is bound to a published clinical trial, sample size denominator, and official label citation. When unverified, SALUS explicitly states reliable information is unavailable.'}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold block">{language === 'ar' ? 'قاعدة الشفافية الصارمة:' : 'Strict Transparency Rule:'}</span>
                <span>{t('unsupportedNotice')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-salus-dark-teal rounded-3xl p-8 sm:p-14 text-white text-center relative overflow-hidden shadow-2xl">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {language === 'ar'
                ? 'ابدأ الآن في تأمين رحلتك العلاجية مع سالوس'
                : 'Start Your Safer Medication Journey Today'}
            </h2>
            <p className="text-salus-light-mint/80 text-sm sm:text-base leading-relaxed">
              {language === 'ar'
                ? 'استكشف أدويتك، سجّل أعراضك اليومية، وشارك سجلك بأمان تام مع الصيدلي.'
                : 'Explore your medications, track daily adverse reactions, and collaborate securely with your licensed pharmacist.'}
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => {
                  loginAsDemoPatient();
                  onNavigate('patient');
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-salus-teal text-white font-bold text-base hover:bg-emerald-600 shadow-xl transition-all"
              >
                {language === 'ar' ? 'تجربة حساب المريض (أحمد حسن)' : 'Try Patient Experience (Ahmed Hassan)'}
              </button>
              <button
                onClick={() => {
                  loginAsDemoPharmacist();
                  onNavigate('pharmacist');
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-base transition-all"
              >
                {language === 'ar' ? 'تجربة لوحة الصيدلي (د. مريم فاروق)' : 'Try Pharmacist Portal (Dr. Mariam Farouk)'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
