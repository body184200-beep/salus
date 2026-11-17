import React from 'react';
import { Shield, PhoneCall, AlertCircle, Heart, Award } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';

export const Footer: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-salus-dark-teal text-white pt-16 pb-12 border-t border-salus-teal/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-white/10">
          {/* Col 1: Brand & Philosophy */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-salus-teal flex items-center justify-center text-white">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold tracking-tight">SALUS | سالوس</span>
            </div>
            <p className="text-xs text-salus-light-mint/80 leading-relaxed mb-4">
              {language === 'ar'
                ? 'منصة الأمان الدوائي والتواصل الإكلينيكي بين المريض والصيدلي. معلومات طبية موثقة مستندة إلى الأدلة والتجارب السريرية الحقيقية.'
                : 'AI-assisted medication safety and patient-pharmacist communication platform. Evidence-backed medical knowledge and clinical follow-up.'}
            </p>
            <div className="flex items-center gap-2 text-xs text-salus-light-mint/90 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
              <span>{language === 'ar' ? 'السوق الأولي: جمهورية مصر العربية' : 'Initial Market: Egypt'}</span>
            </div>
          </div>

          {/* Col 2: SDG Alignment */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-salus-light-mint mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>{t('sdgTitle')}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="font-bold text-emerald-300 mb-1">SDG 3</div>
                <div className="text-[11px] text-gray-200">
                  {language === 'ar' ? 'الصحة الجيدة والرفاه والحد من سمية الأدوية' : 'Good Health & Well-being and toxicities prevention'}
                </div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="font-bold text-sky-300 mb-1">SDG 9</div>
                <div className="text-[11px] text-gray-200">
                  {language === 'ar' ? 'الصناعة والابتكار وبنية التكنولوجيا الصحية' : 'Industry, Innovation & Healthcare Technology'}
                </div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="font-bold text-amber-300 mb-1">SDG 10</div>
                <div className="text-[11px] text-gray-200">
                  {language === 'ar' ? 'الحد من أوجه عدم المساواة عبر دعم كبار السن صوتياً' : 'Reduced Inequalities via Voice Accessibility'}
                </div>
              </div>
            </div>
          </div>

          {/* Col 3: Emergency Contacts */}
          <div className="md:col-span-1">
            <h4 className="text-sm font-bold uppercase tracking-wider text-salus-light-mint mb-4 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-rose-400" />
              <span>{language === 'ar' ? 'أرقام الطوارئ في مصر' : 'Egypt Emergency Lines'}</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
                <div className="text-rose-300 font-bold text-sm flex items-center justify-between">
                  <span>{language === 'ar' ? 'الإسعاف المصري' : 'Egyptian Ambulance'}</span>
                  <span className="font-mono text-base font-black bg-rose-500 text-white px-2 py-0.5 rounded">123</span>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl">
                <div className="text-gray-300 font-semibold text-xs flex items-center justify-between">
                  <span>{language === 'ar' ? 'طوارئ مركز السموم (القصر العيني)' : 'Cairo Poison Control Center'}</span>
                  <span className="font-mono text-xs text-white">02-23640003</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Disclaimer Box */}
        <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-gray-300 leading-relaxed">
            <span className="font-bold text-amber-300 block mb-1">{t('criticalDisclaimerTitle')}</span>
            {t('criticalDisclaimer')}
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 gap-2">
          <div>
            &copy; {new Date().getFullYear()} SALUS (سالوس). Know Your Medicine. Stay Safer.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Privacy by Design</span>
            <span>Explicit Consent</span>
            <span>EDA & DailyMed Verified Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
