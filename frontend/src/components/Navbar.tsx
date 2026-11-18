import React, { useState } from 'react';
import { Shield, Globe, User, LogOut, ChevronDown, HeartPulse, Stethoscope, AlertTriangle, Mic, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';
import { useAuth } from '../context/AuthContext.js';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAssistant?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenAssistant }) => {
  const { language, toggleLanguage, t, isRtl } = useLanguage();
  const {
    user,
    isAuthenticated,
    logout,
    loginAsDemoPatient,
    loginAsDemoDoctor,
    loginAsDemoNurse,
    loginAsDemoPharmacist,
    loginAsDemoPendingPharmacist,
  } = useAuth();
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-salus-light-mint shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('landing')}>
            <img 
              src="/salus_logo.png" 
              alt="SALUS Logo" 
              className="w-11 h-11 rounded-2xl shadow-md shadow-salus-teal/20 transition-transform hover:scale-105 object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold tracking-tight text-salus-dark-teal font-english">SALUS</span>
                <span className="text-xl font-bold text-salus-teal font-arabic">سالوس</span>
              </div>
              <p className="text-[11px] text-salus-muted font-medium hidden sm:block">
                {t('brandTagline')}
              </p>
            </div>
          </div>

          {/* Navigation Items (Desktop) */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => onNavigate('landing')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                currentView === 'landing' ? 'text-salus-teal bg-salus-light-mint' : 'text-salus-muted hover:text-salus-text hover:bg-gray-50'
              }`}
            >
              {t('navHome')}
            </button>

            {isAuthenticated && user?.role === 'patient' && (
              <button
                onClick={() => onNavigate('patient')}
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  currentView === 'patient' ? 'text-salus-teal bg-salus-light-mint' : 'text-salus-muted hover:text-salus-text hover:bg-gray-50'
                }`}
              >
                {t('navSymptoms')}
              </button>
            )}

            {isAuthenticated && user?.role === 'pharmacist' && (
              <button
                onClick={() => onNavigate('pharmacist')}
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  currentView === 'pharmacist' ? 'text-salus-teal bg-salus-light-mint' : 'text-salus-muted hover:text-salus-text hover:bg-gray-50'
                }`}
              >
                {t('pharmTitle')}
              </button>
            )}

            <button
              onClick={() => onNavigate('medications')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                currentView === 'medications' ? 'text-salus-teal bg-salus-light-mint' : 'text-salus-muted hover:text-salus-text hover:bg-gray-50'
              }`}
            >
              {t('navSearch')}
            </button>

            {onOpenAssistant && (
              <button
                onClick={onOpenAssistant}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-salus-light-mint to-emerald-100 text-salus-dark-teal border border-salus-teal/30 hover:border-salus-teal text-xs font-bold transition-all shadow-sm group"
                title={language === 'ar' ? 'استشر د. سمر السيد محمد هاشم' : 'Consult Dr. Samar Hashem'}
              >
                <div className="w-5 h-5 rounded-full bg-salus-teal text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Mic className="w-3 h-3" />
                </div>
                <span>{language === 'ar' ? 'اسأل د. سمر' : 'Ask Dr. Samar'}</span>
              </button>
            )}
          </div>

          {/* Right Action Tools: Language, Demo Selector, Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold text-salus-text hover:bg-salus-light-mint/50 transition-colors"
              title="Switch Language / تغيير اللغة"
            >
              <Globe className="w-4 h-4 text-salus-teal" />
              <span>{t('languageName')}</span>
            </button>

            {/* Quick Demo Selector */}
            <div className="relative">
              <button
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-salus-light-mint/70 border border-salus-teal/20 text-xs font-bold text-salus-dark-teal hover:bg-salus-light-mint transition-colors"
              >
                <HeartPulse className="w-4 h-4 text-salus-teal" />
                <span>{t('demoAccounts')}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {demoMenuOpen && (
                <div
                  className={`absolute mt-2 w-72 rounded-2xl bg-white border border-gray-100 shadow-xl py-2 z-50 text-xs ${
                    isRtl ? 'left-0' : 'right-0'
                  }`}
                >
                  <div className="px-3 py-1.5 text-[11px] font-bold text-salus-muted border-b border-gray-100 uppercase tracking-wider">
                    {language === 'ar' ? 'اختر حساباً تجريبياً جاهزاً' : 'Select a Test Demo Account'}
                  </div>
                  <button
                    onClick={() => {
                      loginAsDemoPatient();
                      setDemoMenuOpen(false);
                      onNavigate('patient');
                    }}
                    className="w-full text-start px-3 py-2.5 hover:bg-salus-light-mint flex items-center gap-2 text-salus-text font-semibold"
                  >
                    <User className="w-4 h-4 text-salus-teal" />
                    <div>
                      <div>{t('demoPatient')}</div>
                      <div className="text-[10px] text-salus-muted font-normal">أملوديبين + جلوكوفاج + سجل أعراض</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      loginAsDemoDoctor();
                      setDemoMenuOpen(false);
                      onNavigate('pharmacist');
                    }}
                    className="w-full text-start px-3 py-2.5 hover:bg-blue-50 flex items-center gap-2 text-salus-text font-semibold"
                  >
                    <HeartPulse className="w-4 h-4 text-blue-600" />
                    <div>
                      <div>{t('demoDoctor')}</div>
                      <div className="text-[10px] text-blue-700 font-normal">طبيب بشري معتمد سريرياً</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      loginAsDemoNurse();
                      setDemoMenuOpen(false);
                      onNavigate('pharmacist');
                    }}
                    className="w-full text-start px-3 py-2.5 hover:bg-emerald-50 flex items-center gap-2 text-salus-text font-semibold"
                  >
                    <HeartPulse className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div>{t('demoNurse')}</div>
                      <div className="text-[10px] text-emerald-700 font-normal">طبيبة صيدلية معتمدة من النقابة العامة لصيادلة مصر</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      loginAsDemoPharmacist();
                      setDemoMenuOpen(false);
                      onNavigate('pharmacist');
                    }}
                    className="w-full text-start px-3 py-2.5 hover:bg-salus-light-mint flex items-center gap-2 text-salus-text font-semibold"
                  >
                    <Stethoscope className="w-4 h-4 text-salus-teal" />
                    <div>
                      <div>{t('demoPharmVerified')}</div>
                      <div className="text-[10px] text-green-700 font-normal">صيدلي مرخص - نقابة صيادلة مصر</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      loginAsDemoPendingPharmacist();
                      setDemoMenuOpen(false);
                      onNavigate('pharmacist');
                    }}
                    className="w-full text-start px-3 py-2.5 hover:bg-amber-50 flex items-center gap-2 text-salus-text font-semibold"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <div>
                      <div>{t('demoPharmPending')}</div>
                      <div className="text-[10px] text-amber-700 font-normal">صيدلي قيد المراجعة (صلاحيات معلقة)</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* User Profile or Login */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate(user?.role === 'pharmacist' ? 'pharmacist' : 'patient')}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-salus-light-mint text-salus-dark-teal text-xs sm:text-sm font-bold border border-salus-teal/20"
                >
                  <span className="w-2 h-2 rounded-full bg-salus-teal animate-pulse" />
                  <span className="max-w-[120px] truncate">{user?.displayName}</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    onNavigate('landing');
                  }}
                  className="p-2 rounded-xl text-salus-muted hover:text-salus-critical hover:bg-red-50 transition-colors"
                  title={t('logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('auth')}
                className="px-4 py-2 rounded-xl bg-salus-teal text-white text-xs sm:text-sm font-bold shadow-md shadow-salus-teal/20 hover:bg-salus-dark-teal transition-all"
              >
                {t('login')}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
