import React, { useState } from 'react';
import { Shield, User, Stethoscope, Lock, Mail, Building2, Award, CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';

interface AuthPageProps {
  onSuccess: (role: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const { language, t } = useLanguage();
  const { login, loginAsDemoPatient, loginAsDemoPharmacist, loginAsDemoPendingPharmacist } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'patient' | 'pharmacist'>('patient');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [ageRange, setAgeRange] = useState('50-64');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [syndicateNumber, setSyndicateNumber] = useState('');

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
          onSuccess(res.user.role);
        } else {
          setErrorMsg(language === 'ar' ? res.errorAr || res.error : res.error);
        }
      } else {
        // Register
        const payload: any = {
          email,
          password,
          displayName,
          role,
          preferredLanguage: language,
        };

        if (role === 'patient') {
          payload.ageRange = ageRange;
          payload.privacyConsent = privacyConsent;
        } else {
          payload.licenseNumber = licenseNumber;
          payload.workplace = workplace;
          payload.syndicateNumber = syndicateNumber;
        }

        const res = await api.register(payload);
        if (res.token) {
          login(res.token, res.user);
          onSuccess(res.user.role);
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole('patient')}
              className={`flex-1 p-3 rounded-2xl border-2 flex items-center justify-center gap-2 text-sm font-bold transition-all ${
                role === 'patient'
                  ? 'border-salus-teal bg-salus-light-mint text-salus-dark-teal'
                  : 'border-gray-200 text-salus-muted hover:border-gray-300'
              }`}
            >
              <User className="w-4 h-4" />
              <span>{language === 'ar' ? 'حساب مريض' : 'Patient Account'}</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('pharmacist')}
              className={`flex-1 p-3 rounded-2xl border-2 flex items-center justify-center gap-2 text-sm font-bold transition-all ${
                role === 'pharmacist'
                  ? 'border-salus-teal bg-salus-light-mint text-salus-dark-teal'
                  : 'border-gray-200 text-salus-muted hover:border-gray-300'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>{language === 'ar' ? 'حساب صيدلي' : 'Pharmacist Account'}</span>
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

          {/* Pharmacist specific fields */}
          {mode === 'register' && role === 'pharmacist' && (
            <>
              <div>
                <label className="block text-xs font-bold text-salus-text mb-1">
                  {language === 'ar' ? 'رقم ترخيص مزاولة المهنة (مصر)' : 'Egyptian Professional License Number'}
                </label>
                <input
                  type="text"
                  required
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
                  required
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

              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                {language === 'ar'
                  ? 'ملاحظة أمان: يبدأ حساب الصيدلي بحالة "قيد المراجعة" ولن تُمنح الصلاحيات المهنية والاطلاع على بيانات المرضى إلا بعد مراجعة بيانات ترخيص النقابة.'
                  : 'Notice: Pharmacist accounts start in "Pending" status. Professional access is granted only after syndicate registration verification.'}
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
