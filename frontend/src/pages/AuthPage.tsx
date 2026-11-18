import React, { useState } from 'react';
import { Shield, User, Stethoscope, Lock, Mail, Building2, Award, CheckCircle, AlertCircle, HeartPulse, UserCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';

interface AuthPageProps {
  onSuccess: (role: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const { language, t } = useLanguage();
  const {
    login,
    loginAsDemoPatient,
    loginAsDemoDoctor,
    loginAsDemoNurse,
    loginAsDemoPharmacist,
    loginAsDemoPendingPharmacist,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'patient' | 'doctor' | 'pharmacist' | 'nurse'>('patient');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [ageRange, setAgeRange] = useState('50-64');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [syndicateNumber, setSyndicateNumber] = useState('');
  const [specialty, setSpecialty] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.login(email, password);
        if (res.token) {
          login(res.token, res.user);
          onSuccess(res.user.role === 'patient' ? 'patient' : 'pharmacist');
        } else {
          setErrorMsg(language === 'ar' ? res.errorAr || res.error : res.error);
        }
      } else {
        // Register
        const payload: any = {
          email,
          password,
          displayName: (role === 'doctor' && !displayName.startsWith('د.')) ? `د. ${displayName}` : displayName,
          role,
          preferredLanguage: language,
        };

        if (role === 'patient') {
          payload.ageRange = ageRange;
          payload.privacyConsent = privacyConsent;
        } else {
          payload.licenseNumber = licenseNumber || (role === 'doctor' ? 'EGY-MD-REGISTERED' : 'EGY-PH-REGISTERED');
          payload.workplace = workplace || (role === 'doctor' ? 'عيادة خاصة / مستشفى' : 'صيدلية');
          payload.syndicateNumber = syndicateNumber;
          payload.specialty = specialty;
        }

        const res = await api.register(payload);
        if (res.token) {
          login(res.token, res.user);
          onSuccess(res.user.role === 'patient' ? 'patient' : 'pharmacist');
        } else {
          setErrorMsg(language === 'ar' ? res.errorAr || res.error : res.error);
        }
      }
    } catch (err: any) {
      setErrorMsg('Connection failed. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      {/* Demo Selector Banner */}
      <div className="bg-salus-light-mint/70 border border-salus-teal/20 rounded-3xl p-5 mb-8">
        <div className="text-xs font-bold text-salus-dark-teal uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-salus-teal" />
          <span>{language === 'ar' ? 'تسجيل دخول تجريبي فوري بنقرة واحدة:' : 'Instant One-Click Demo Sign In:'}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          <button
            onClick={async () => {
              await loginAsDemoPatient();
              onSuccess('patient');
            }}
            className="p-2.5 bg-white rounded-xl border border-salus-teal/30 hover:border-salus-teal text-start transition-all"
          >
            <div className="text-xs font-bold text-salus-text">{t('demoPatient')}</div>
            <div className="text-[10px] text-salus-muted">أحمد حسن (مريض)</div>
          </button>
          <button
            onClick={async () => {
              await loginAsDemoDoctor();
              onSuccess('pharmacist');
            }}
            className="p-2.5 bg-white rounded-xl border border-blue-300 hover:border-blue-600 text-start transition-all"
          >
            <div className="text-xs font-bold text-blue-800">{t('demoDoctor')}</div>
            <div className="text-[10px] text-blue-600">طبيب معتمد سريرياً</div>
          </button>
          <button
            onClick={async () => {
              await loginAsDemoNurse();
              onSuccess('pharmacist');
            }}
            className="p-2.5 bg-white rounded-xl border border-emerald-300 hover:border-emerald-600 text-start transition-all"
          >
            <div className="text-xs font-bold text-emerald-800">{t('demoNurse')}</div>
            <div className="text-[10px] text-emerald-600">طبيبة صيدلية معتمدة من النقابة العامة لصيادلة مصر</div>
          </button>
          <button
            onClick={async () => {
              await loginAsDemoPharmacist();
              onSuccess('pharmacist');
            }}
            className="p-2.5 bg-white rounded-xl border border-green-300 hover:border-green-600 text-start transition-all"
          >
            <div className="text-xs font-bold text-green-800">{t('demoPharmVerified')}</div>
            <div className="text-[10px] text-green-600">صيدلي مرخص معتمد</div>
          </button>
          <button
            onClick={async () => {
              await loginAsDemoPendingPharmacist();
              onSuccess('pharmacist');
            }}
            className="p-2.5 bg-white rounded-xl border border-amber-300 hover:border-amber-600 text-start transition-all"
          >
            <div className="text-xs font-bold text-amber-800">{t('demoPharmPending')}</div>
            <div className="text-[10px] text-amber-600">صيدلي قيد المراجعة</div>
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl">
        {/* Toggle Login / Register */}
        <div className="flex p-1 bg-salus-bg rounded-2xl mb-8">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
              mode === 'login' ? 'bg-white text-salus-teal shadow-sm' : 'text-salus-muted hover:text-salus-text'
            }`}
          >
            {t('login')}
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
              mode === 'register' ? 'bg-white text-salus-teal shadow-sm' : 'text-salus-muted hover:text-salus-text'
            }`}
          >
            {t('register')}
          </button>
        </div>

        {/* Role Toggle if Register */}
        {mode === 'register' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
            <button
              type="button"
              onClick={() => setRole('patient')}
              className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                role === 'patient'
                  ? 'border-salus-teal bg-salus-light-mint text-salus-dark-teal'
                  : 'border-gray-200 text-salus-muted hover:border-gray-300'
              }`}
            >
              <User className="w-4 h-4" />
              <span>{language === 'ar' ? 'حساب مريض' : 'Patient'}</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('doctor')}
              className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                role === 'doctor'
                  ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm'
                  : 'border-gray-200 text-salus-muted hover:border-gray-300'
              }`}
            >
              <HeartPulse className="w-4 h-4 text-blue-600" />
              <span>{language === 'ar' ? 'حساب طبيب (دكتور)' : 'Doctor'}</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('pharmacist')}
              className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                role === 'pharmacist'
                  ? 'border-salus-teal bg-salus-light-mint text-salus-dark-teal'
                  : 'border-gray-200 text-salus-muted hover:border-gray-300'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>{language === 'ar' ? 'حساب صيدلي' : 'Pharmacist'}</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('nurse')}
              className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                role === 'nurse'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm'
                  : 'border-gray-200 text-salus-muted hover:border-gray-300'
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>{language === 'ar' ? 'هيئة التمريض' : 'Nurse'}</span>
            </button>
          </div>
        )}

        {/* Error / Success message */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-salus-text mb-1">
                {language === 'ar' ? 'الاسم بالكامل' : 'Full Name / Display Name'}
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={role === 'patient' ? 'أحمد حسن' : 'د. مريم فاروق'}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-salus-teal/20 focus:border-salus-teal text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-salus-text mb-1">
              {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-salus-teal/20 focus:border-salus-teal text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-salus-text mb-1">
              {language === 'ar' ? 'كلمة المرور (8 أحرف على الأقل)' : 'Password (min. 8 characters)'}
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-salus-teal/20 focus:border-salus-teal text-sm"
            />
          </div>

          {/* Patient specific fields */}
          {mode === 'register' && role === 'patient' && (
            <>
              <div>
                <label className="block text-xs font-bold text-salus-text mb-1">
                  {language === 'ar' ? 'الفئة العمرية (اختياري)' : 'Age Range (Optional)'}
                </label>
                <select
                  value={ageRange}
                  onChange={(e) => setAgeRange(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-salus-teal/20 focus:border-salus-teal text-sm bg-white"
                >
                  <option value="18-35">18 - 35</option>
                  <option value="36-49">36 - 49</option>
                  <option value="50-64">50 - 64</option>
                  <option value="65+">65+</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={privacyConsent}
                    onChange={(e) => setPrivacyConsent(e.target.checked)}
                    className="mt-1 rounded text-salus-teal focus:ring-salus-teal w-4 h-4"
                  />
                  <span className="text-xs text-salus-muted leading-relaxed">
                    {language === 'ar'
                      ? 'أوافق صراحة على شروط الخصوصية ومعالجة بياناتي الصحية لأغراض السلامة الدوائية والتواصل مع الصيدلي.'
                      : 'I explicitly agree to data privacy terms and consent to processing my medication logs for safety and pharmacist follow-up.'}
                  </span>
                </label>
              </div>
            </>
          )}

          {/* Doctor specific fields */}
          {mode === 'register' && role === 'doctor' && (
            <>
              <div>
                <label className="block text-xs font-bold text-salus-text mb-1">
                  {language === 'ar' ? 'التخصص الطبي' : 'Medical Specialty'}
                </label>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder={language === 'ar' ? 'أمراض الباطنة والقلب / طب الأسرة' : 'Internal Medicine / Family Medicine'}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-salus-text mb-1">
                  {language === 'ar' ? 'المستشفى أو العيادة' : 'Hospital / Clinic / Workplace'}
                </label>
                <input
                  type="text"
                  value={workplace}
                  onChange={(e) => setWorkplace(e.target.value)}
                  placeholder={language === 'ar' ? 'مستشفى قصر العيني / عيادة خاصة' : 'General Hospital / Private Clinic'}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-salus-text mb-1">
                  {language === 'ar' ? 'رقم ترخيص مزاولة المهنة (اختياري)' : 'Medical License Number (Optional)'}
                </label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="EGY-MD-12345"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                />
              </div>

              <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200 text-[11px] text-blue-900 leading-relaxed flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  {language === 'ar'
                    ? 'تفعيل فوري: يمكن لأي دكتور إنشاء حساب والوصول فوراً إلى لوحة المتابعة السريرية وسجلات المرضى.'
                    : 'Instant Activation: Any doctor can create an account and immediately access the clinical monitoring portal.'}
                </span>
              </div>
            </>
          )}

          {/* Nurse specific fields */}
          {mode === 'register' && role === 'nurse' && (
            <>
              <div>
                <label className="block text-xs font-bold text-salus-text mb-1">
                  {language === 'ar' ? 'المستشفى أو قسم التمريض' : 'Hospital / Nursing Department'}
                </label>
                <input
                  type="text"
                  value={workplace}
                  onChange={(e) => setWorkplace(e.target.value)}
                  placeholder={language === 'ar' ? 'مستشفى السلام الدولي' : 'Hospital'}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                />
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-[11px] text-emerald-900 leading-relaxed flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {language === 'ar'
                    ? 'تفعيل فوري: حساب التمريض مفعل مباشرة لرعاية المرضى ومتابعة الأعراض.'
                    : 'Instant Activation: Nurse accounts are active immediately for patient follow-up.'}
                </span>
              </div>
            </>
          )}

          {/* Pharmacist specific fields */}
          {mode === 'register' && role === 'pharmacist' && (
            <>
              <div>
                <label className="block text-xs font-bold text-salus-text mb-1">
                  {language === 'ar' ? 'رقم ترخيص مزاولة المهنة (مصر)' : 'Egyptian Professional License Number'}
                </label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="EGY-PH-12345"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-salus-teal/20 focus:border-salus-teal text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-salus-text mb-1">
                  {language === 'ar' ? 'مكان العمل أو الصيدلية' : 'Workplace / Pharmacy Name & Branch'}
                </label>
                <input
                  type="text"
                  value={workplace}
                  onChange={(e) => setWorkplace(e.target.value)}
                  placeholder="صيدلية النيل - المعادي"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-salus-teal/20 focus:border-salus-teal text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-salus-text mb-1">
                  {language === 'ar' ? 'رقم القيد بنقابة الصيادلة' : 'Syndicate Registration Number'}
                </label>
                <input
                  type="text"
                  value={syndicateNumber}
                  onChange={(e) => setSyndicateNumber(e.target.value)}
                  placeholder="SYN-99881"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-salus-teal/20 focus:border-salus-teal text-sm"
                />
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-[11px] text-emerald-900 leading-relaxed flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {language === 'ar'
                    ? 'تفعيل فوري: يتم تفعيل حساب الصيدلي فوراً مع الصلاحيات السريرية الكاملة.'
                    : 'Instant Activation: Pharmacist account is immediately activated with full clinical review features.'}
                </span>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-salus-teal text-white font-bold text-base shadow-xl shadow-salus-teal/20 hover:bg-salus-dark-teal transition-all disabled:opacity-50 mt-6"
          >
            {loading ? '...' : mode === 'login' ? t('login') : t('register')}
          </button>
        </form>
      </div>
    </div>
  );
};
