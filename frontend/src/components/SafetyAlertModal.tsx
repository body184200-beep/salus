import React from 'react';
import { AlertOctagon, PhoneCall, X, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';

interface SafetyAlertModalProps {
  alert: {
    alertLevel: 'urgent_emergency' | 'warning_pharmacist_review' | 'info';
    triggerReason: string;
    recommendationEn: string;
    recommendationAr: string;
    emergencyNumberEgypt?: string;
  } | null;
  onClose: () => void;
}

export const SafetyAlertModal: React.FC<SafetyAlertModalProps> = ({ alert, onClose }) => {
  const { language, isRtl } = useLanguage();

  if (!alert || alert.alertLevel === 'info') return null;

  const isEmergency = alert.alertLevel === 'urgent_emergency';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl transition-all border-2 ${
          isEmergency ? 'bg-rose-50 border-rose-500' : 'bg-amber-50 border-amber-500'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${
                isEmergency ? 'bg-salus-critical animate-bounce' : 'bg-amber-600'
              }`}
            >
              {isEmergency ? <AlertOctagon className="w-7 h-7" /> : <ShieldAlert className="w-7 h-7" />}
            </div>
            <div>
              <h3 className={`text-xl font-black ${isEmergency ? 'text-salus-critical' : 'text-amber-900'}`}>
                {isEmergency
                  ? language === 'ar'
                    ? 'تحذير طبي طارئ - يلزم التدخل الفوري'
                    : 'CRITICAL EMERGENCY MEDICAL WARNING'
                  : language === 'ar'
                  ? 'تنبيه سريري - يلزم مراجعة الصيدلي'
                  : 'Clinical Warning - Pharmacist Review Recommended'}
              </h3>
              <p className="text-xs text-gray-600 font-medium">SALUS Deterministic Safety Rule Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:text-gray-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reason */}
        <div className="bg-white/80 rounded-2xl p-4 border border-gray-200/60 mb-5">
          <div className="text-xs font-bold uppercase text-gray-500 mb-1">
            {language === 'ar' ? 'العرض المسجل المسبب للإنذار:' : 'Triggering Symptom Flag:'}
          </div>
          <p className="text-sm font-bold text-gray-800">{alert.triggerReason}</p>
        </div>

        {/* Clinical Recommendation */}
        <div className="mb-6">
          <div className="text-xs font-bold uppercase text-gray-500 mb-1">
            {language === 'ar' ? 'التوجيه الطبي المعتمد:' : 'Clinical Guidance:'}
          </div>
          <p className="text-sm font-semibold leading-relaxed text-gray-800">
            {language === 'ar' ? alert.recommendationAr : alert.recommendationEn}
          </p>
        </div>

        {/* Emergency Action Button */}
        {isEmergency && (
          <div className="bg-salus-critical text-white p-4 rounded-2xl flex items-center justify-between mb-6 shadow-lg shadow-rose-600/30">
            <div className="flex items-center gap-3">
              <PhoneCall className="w-6 h-6 animate-pulse" />
              <div>
                <div className="text-xs font-semibold opacity-90">
                  {language === 'ar' ? 'اتصل بالإسعاف المصري فوراً' : 'Call Egyptian Ambulance Immediately'}
                </div>
                <div className="text-2xl font-black font-mono">123</div>
              </div>
            </div>
            <a
              href="tel:123"
              className="px-4 py-2 bg-white text-salus-critical font-black text-sm rounded-xl hover:bg-gray-100 transition-colors"
            >
              {language === 'ar' ? 'اتصال الآن' : 'Call 123'}
            </a>
          </div>
        )}

        {/* Disclaimer Note */}
        <p className="text-[11px] text-gray-500 leading-normal mb-5 text-center">
          {language === 'ar'
            ? 'تنبيه: سالوس منصة توجيهية ولا تقدم تشخيصاً طبياً. في الحالات المهددة للحياة توجه فوراً لأقرب مستشفى طوارئ.'
            : 'Notice: SALUS is an information system. For life-threatening emergencies, proceed immediately to the nearest hospital emergency room.'}
        </p>

        {/* Close acknowledge button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gray-900 text-white font-bold text-sm hover:bg-black transition-colors"
        >
          {language === 'ar' ? 'فهمت التنبيه (إغلاق)' : 'I Understand This Warning (Dismiss)'}
        </button>
      </div>
    </div>
  );
};
