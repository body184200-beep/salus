import React, { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  Camera,
  Mic,
  Pill,
  FileText,
  UserCheck,
  Settings,
  AlertTriangle,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Shield,
  Download,
  Share2,
  Volume2,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Heart,
  Footprints,
  Compass,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { VoiceAssistantModal } from '../components/VoiceAssistantModal.js';
import { ScanMedicationModal } from '../components/ScanMedicationModal.js';
import { MedicationsView } from '../components/MedicationsView.js';
import { SafetyAlertModal } from '../components/SafetyAlertModal.js';

export const PatientDashboard: React.FC = () => {
  const { language, t, isRtl } = useLanguage();
  const { user } = useAuth();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'symptoms' | 'meds' | 'search' | 'reports' | 'connect' | 'settings'>('overview');

  // Modals
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [activeAlert, setActiveAlert] = useState<any | null>(null);

  // Symptoms State
  const [symptoms, setSymptoms] = useState<any[]>([]);
  const [loadingSymptoms, setLoadingSymptoms] = useState(false);

  // New Symptom Form State
  const [symptomName, setSymptomName] = useState('');
  const [selectedMedId, setSelectedMedId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('moderate');
  const [duration, setDuration] = useState('3 days');
  const [isOngoing, setIsOngoing] = useState(true);
  const [impactDaily, setImpactDaily] = useState(false);
  const [impactBalance, setImpactBalance] = useState(false);
  const [impactWalking, setImpactWalking] = useState(false);
  const [impactMobility, setImpactMobility] = useState(false);
  const [fatigueExertion, setFatigueExertion] = useState(false);
  const [notes, setNotes] = useState('');

  // Active Prescriptions State
  const [patientMeds, setPatientMeds] = useState<any[]>([]);

  // Consent & Invite Codes State
  const [grants, setGrants] = useState<any[]>([]);
  const [newInviteCode, setNewInviteCode] = useState<string | null>(null);
  const [inviteNotes, setInviteNotes] = useState('');

  // Report State
  const [reportSummary, setReportSummary] = useState<any | null>(null);

  useEffect(() => {
    loadPatientData();
  }, [activeTab]);

  const loadPatientData = async () => {
    try {
      const [symRes, medsRes, grantsRes] = await Promise.all([
        api.getSymptoms(),
        api.getActiveMedications(),
        api.getMyGrants(),
      ]);

      if (symRes.symptoms) setSymptoms(symRes.symptoms);
      if (medsRes.medications) setPatientMeds(medsRes.medications);
      if (grantsRes.grants) setGrants(grantsRes.grants);
    } catch (err) {
      console.error('Failed to load patient dashboard records:', err);
    }
  };

  const handleCreateSymptom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomName.trim()) return;

    try {
      const res = await api.createSymptom({
        symptomName,
        activeIngredientId: selectedMedId || null,
        startDate,
        startTime,
        severity,
        duration,
        isOngoing,
        impactDailyActivities: impactDaily,
        impactBalance,
        impactWalking,
        impactMobility,
        fatigueDuringActivities: fatigueExertion,
        notes,
        isSharedWithPharmacist: true,
      });

      // If safety alert triggered, show alert modal
      if (res.safetyAlert) {
        setActiveAlert(res.safetyAlert);
      }

      // Reset form & reload
      setSymptomName('');
      setNotes('');
      loadPatientData();
      setActiveTab('symptoms');
    } catch (err) {
      console.error('Error logging symptom:', err);
    }
  };

  const handleDeleteSymptom = async (id: string) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا العرض من سجلك؟' : 'Are you sure you want to delete this symptom record?')) {
      return;
    }
    try {
      await api.deleteSymptom(id);
      loadPatientData();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleGenerateInvite = async () => {
    try {
      const res = await api.createConsentInvite({
        scope: 'all_symptoms',
        notes: inviteNotes || 'طلب استشارة ومتابعة سريرية لأعراض الضغط والسكري',
      });
      if (res.invitationCode) {
        setNewInviteCode(res.invitationCode);
        loadPatientData();
      }
    } catch (err) {
      console.error('Error generating invite:', err);
    }
  };

  const handleRevokeGrant = async (id: string) => {
    if (!confirm(language === 'ar' ? 'هل تود إلغاء صلاحية الوصول للصيدلي فوراً؟' : 'Revoke pharmacist access immediately?')) {
      return;
    }
    try {
      await api.revokeConsent(id);
      loadPatientData();
    } catch (err) {
      console.error('Revoke error:', err);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'ar' ? 'ar-EG' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-salus-dark-teal via-salus-teal to-emerald-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            <span>{language === 'ar' ? 'لوحة المريض سالوس • متابعة شخصية' : 'SALUS Patient Portal'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black mb-2">
            {language === 'ar' ? `أهلاً بك، ${user?.displayName || 'أحمد حسن'}` : `Welcome, ${user?.displayName || 'Ahmed Hassan'}`}
          </h1>
          <p className="text-salus-light-mint/90 text-sm leading-relaxed mb-6">
            {language === 'ar'
              ? 'تابع أدويتك، سجّل أي أعراض تشعر بها بصوتك أو كتابة، وشارك تقريرك المعتمد مع صيدليك المفضل.'
              : 'Keep track of your active medications, log side effects by voice or text, and share records with your pharmacist.'}
          </p>

          {/* Quick Voice & Scan Hero Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setVoiceOpen(true)}
              className="px-6 py-3.5 rounded-2xl bg-white text-salus-dark-teal font-black text-sm flex items-center gap-2 shadow-lg hover:bg-salus-light-mint transition-all"
            >
              <Mic className="w-5 h-5 text-salus-teal animate-pulse" />
              <span>{language === 'ar' ? 'المساعد الصوتي (تحدث الآن)' : 'Speak with Voice Assistant'}</span>
            </button>

            <button
              onClick={() => setScanOpen(true)}
              className="px-6 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-black text-sm flex items-center gap-2 transition-all"
            >
              <Camera className="w-5 h-5" />
              <span>{language === 'ar' ? 'مسح علبة الدواء' : 'Scan Packaging'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation Buttons (Large & Accessible) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-salus-teal text-white shadow-md shadow-salus-teal/20'
              : 'bg-white text-salus-muted hover:text-salus-text border border-gray-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>{language === 'ar' ? 'نظرة عامة' : 'Overview'}</span>
        </button>

        <button
          onClick={() => setActiveTab('symptoms')}
          className={`px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'symptoms'
              ? 'bg-salus-teal text-white shadow-md shadow-salus-teal/20'
              : 'bg-white text-salus-muted hover:text-salus-text border border-gray-100'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>{language === 'ar' ? 'سجل الأعراض' : 'Symptom Log'}</span>
          {symptoms.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'symptoms' ? 'bg-white/20 text-white' : 'bg-salus-light-mint text-salus-teal'}`}>
              {symptoms.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('meds')}
          className={`px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'meds'
              ? 'bg-salus-teal text-white shadow-md shadow-salus-teal/20'
              : 'bg-white text-salus-muted hover:text-salus-text border border-gray-100'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>{language === 'ar' ? 'أدويتي الحالية' : 'My Medications'}</span>
          {patientMeds.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'meds' ? 'bg-white/20 text-white' : 'bg-salus-light-mint text-salus-teal'}`}>
              {patientMeds.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('search')}
          className={`px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'search'
              ? 'bg-salus-teal text-white shadow-md shadow-salus-teal/20'
              : 'bg-white text-salus-muted hover:text-salus-text border border-gray-100'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>{language === 'ar' ? 'دليل الأدوية الموثق' : 'Drug Monograph'}</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'bg-salus-teal text-white shadow-md shadow-salus-teal/20'
              : 'bg-white text-salus-muted hover:text-salus-text border border-gray-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{language === 'ar' ? 'التقرير الطبي (PDF)' : 'Medical Report'}</span>
        </button>

        <button
          onClick={() => setActiveTab('connect')}
          className={`px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'connect'
              ? 'bg-salus-teal text-white shadow-md shadow-salus-teal/20'
              : 'bg-white text-salus-muted hover:text-salus-text border border-gray-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>{language === 'ar' ? 'مشاركة الصيدلي' : 'Pharmacist Share'}</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Quick Symptom Logger + Recent Activity */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Log Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-salus-light-mint flex items-center justify-center text-salus-teal">
                    <Plus className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-lg text-salus-dark-teal">{t('logSymptomTitle')}</h3>
                </div>
                <button
                  onClick={() => setVoiceOpen(true)}
                  className="text-xs font-bold text-salus-teal hover:underline flex items-center gap-1"
                >
                  <Mic className="w-4 h-4" />
                  <span>{language === 'ar' ? 'تسجيل بالصوت' : 'Voice Log'}</span>
                </button>
              </div>

              <form onSubmit={handleCreateSymptom} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-salus-text mb-1">{t('symptomNameLabel')}</label>
                  <input
                    type="text"
                    required
                    value={symptomName}
                    onChange={(e) => setSymptomName(e.target.value)}
                    placeholder={t('symptomNamePlaceholder')}
                    className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-salus-teal/20 focus:border-salus-teal text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-salus-text mb-1">
                      {language === 'ar' ? 'مرتبط بأي دواء؟ (اختياري)' : 'Related Medication (Optional)'}
                    </label>
                    <select
                      value={selectedMedId}
                      onChange={(e) => setSelectedMedId(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-salus-teal/20 text-xs bg-white"
                    >
                      <option value="">{language === 'ar' ? 'غير محدد / عرض عام' : 'General / Not specified'}</option>
                      {patientMeds.map((m) => (
                        <option key={m.id} value={m.active_ingredient_id}>
                          {m.brand_name_en || m.custom_name || m.active_name_en} ({m.dosage || ''})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-salus-text mb-1">{t('severityLabel')}</label>
                    <div className="flex gap-2">
                      {(['mild', 'moderate', 'severe'] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSeverity(s)}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold capitalize transition-all ${
                            severity === s
                              ? s === 'severe'
                                ? 'bg-salus-critical text-white'
                                : s === 'moderate'
                                ? 'bg-amber-500 text-white'
                                : 'bg-emerald-600 text-white'
                              : 'bg-salus-bg text-salus-muted border border-gray-200'
                          }`}
                        >
                          {s === 'mild' ? t('severityMild') : s === 'moderate' ? t('severityModerate') : t('severitySevere')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Physiotherapy & Functional Mobility Impact Checkboxes */}
                <div className="p-4 bg-salus-bg rounded-2xl border border-gray-200/60 space-y-2">
                  <div className="text-xs font-bold text-salus-dark-teal flex items-center gap-1.5 mb-2">
                    <Activity className="w-4 h-4 text-salus-teal" />
                    <span>{t('mobilityImpactTitle')}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-white border border-gray-200">
                      <input
                        type="checkbox"
                        checked={impactBalance}
                        onChange={(e) => setImpactBalance(e.target.checked)}
                        className="rounded text-salus-teal"
                      />
                      <span className="text-gray-700">{t('impactBalance')}</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-white border border-gray-200">
                      <input
                        type="checkbox"
                        checked={impactWalking}
                        onChange={(e) => setImpactWalking(e.target.checked)}
                        className="rounded text-salus-teal"
                      />
                      <span className="text-gray-700">{t('impactWalking')}</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-white border border-gray-200">
                      <input
                        type="checkbox"
                        checked={impactMobility}
                        onChange={(e) => setImpactMobility(e.target.checked)}
                        className="rounded text-salus-teal"
                      />
                      <span className="text-gray-700">{t('impactMobility')}</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-white border border-gray-200">
                      <input
                        type="checkbox"
                        checked={fatigueExertion}
                        onChange={(e) => setFatigueExertion(e.target.checked)}
                        className="rounded text-salus-teal"
                      />
                      <span className="text-gray-700">{t('impactFatigue')}</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-salus-teal text-white font-bold text-sm shadow-md shadow-salus-teal/20 hover:bg-salus-dark-teal transition-all"
                >
                  {t('saveSymptomBtn')}
                </button>
              </form>
            </div>

            {/* Recent Symptoms Summary */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-lg text-salus-dark-teal">
                  {language === 'ar' ? 'آخر الأعراض المسجلة' : 'Recent Symptoms'}
                </h3>
                <button
                  onClick={() => setActiveTab('symptoms')}
                  className="text-xs font-bold text-salus-teal hover:underline flex items-center gap-1"
                >
                  <span>{language === 'ar' ? 'عرض السجل الكامل' : 'View All'}</span>
                  <ChevronRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {symptoms.length === 0 ? (
                <div className="p-8 text-center text-salus-muted text-xs">
                  {language === 'ar' ? 'لا توجد أعراض مسجلة بعد. استخدم النموذج أعلاه لبدء التسجيل.' : 'No symptoms logged yet.'}
                </div>
              ) : (
                <div className="space-y-3">
                  {symptoms.slice(0, 3).map((sym) => (
                    <div
                      key={sym.id}
                      className="p-4 rounded-2xl bg-salus-bg border border-gray-200/60 flex items-start justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm text-salus-text">{sym.symptom_name}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              sym.severity === 'severe'
                                ? 'bg-rose-100 text-rose-800'
                                : sym.severity === 'moderate'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {sym.severity.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-xs text-salus-muted">
                          {sym.start_date} • {sym.duration || (language === 'ar' ? 'مستمر' : 'Ongoing')}
                        </div>
                        {sym.notes && <p className="text-xs text-gray-600 mt-1 italic">"{sym.notes}"</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Col: Active Meds + Consent Status */}
          <div className="space-y-8">
            {/* Active Meds Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Pill className="w-5 h-5 text-salus-teal" />
                  <h3 className="font-black text-lg text-salus-dark-teal">
                    {language === 'ar' ? 'أدويتي المسجلة' : 'My Medications'}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('meds')}
                  className="text-xs font-bold text-salus-teal hover:underline"
                >
                  {language === 'ar' ? 'إدارة' : 'Manage'}
                </button>
              </div>

              {patientMeds.length === 0 ? (
                <div className="p-6 text-center text-xs text-salus-muted">
                  {language === 'ar' ? 'لا توجد أدوية مسجلة حالياً.' : 'No active prescriptions.'}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {patientMeds.map((med) => (
                    <div key={med.id} className="p-3.5 rounded-2xl bg-salus-bg border border-gray-200/60 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-xs text-salus-dark-teal">
                          {med.custom_name || med.brand_name_en || med.active_name_en}
                        </div>
                        <div className="text-[11px] text-salus-muted">{med.frequency || med.dosage}</div>
                      </div>
                      <span className="text-[10px] font-bold bg-salus-light-mint text-salus-teal px-2 py-0.5 rounded">
                        {med.dosage || '5 mg'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pharmacist Connection Status */}
            <div className="bg-salus-light-mint/40 rounded-3xl p-6 sm:p-8 border border-salus-teal/20">
              <div className="flex items-center gap-2 text-salus-dark-teal font-black text-base mb-2">
                <UserCheck className="w-5 h-5 text-salus-teal" />
                <span>{language === 'ar' ? 'ربط المتابعة مع الصيدلي' : 'Pharmacist Follow-up'}</span>
              </div>
              <p className="text-xs text-salus-muted leading-relaxed mb-4">
                {language === 'ar'
                  ? 'أنشئ كود مشاركة سري وأعطه لصيدليك في الصيدلية لتمكينه من مراجعة أعراضك وتقديم استشارة دوائية متخصصة.'
                  : 'Generate a short-lived token to grant your pharmacist access to review your symptoms.'}
              </p>
              <button
                onClick={() => setActiveTab('connect')}
                className="w-full py-3 rounded-2xl bg-salus-teal text-white font-bold text-xs shadow-md hover:bg-salus-dark-teal transition-all"
              >
                {t('generateInviteTitle')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SYMPTOMS FULL TIMELINE */}
      {activeTab === 'symptoms' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-2xl font-black text-salus-dark-teal">
                {language === 'ar' ? 'سجل متابعة الأعراض الزمني' : 'Symptom Timeline History'}
              </h2>
              <p className="text-xs text-salus-muted">
                {language === 'ar' ? 'سجل كامل للأعراض وتأثيرها على الحركة والاتزان' : 'Complete history with severity & functional mobility impact'}
              </p>
            </div>

            <button
              onClick={() => setActiveTab('overview')}
              className="px-4 py-2.5 rounded-xl bg-salus-teal text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>{t('logSymptomTitle')}</span>
            </button>
          </div>

          {symptoms.length === 0 ? (
            <div className="py-16 text-center text-salus-muted text-sm">
              {language === 'ar' ? 'لم تقم بتسجيل أي أعراض بعد.' : 'No symptom records found.'}
            </div>
          ) : (
            <div className="relative border-s-2 border-salus-teal/20 ms-4 space-y-6">
              {symptoms.map((sym) => (
                <div key={sym.id} className="relative ms-6">
                  {/* Timeline dot */}
                  <div
                    className={`absolute -start-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white ${
                      sym.severity === 'severe'
                        ? 'bg-rose-500'
                        : sym.severity === 'moderate'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  />

                  <div className="p-5 rounded-2xl bg-salus-bg border border-gray-200/70 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base text-salus-dark-teal">{sym.symptom_name}</span>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-lg ${
                            sym.severity === 'severe'
                              ? 'bg-rose-100 text-rose-800'
                              : sym.severity === 'moderate'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {sym.severity.toUpperCase()}
                        </span>
                        {sym.is_ongoing && (
                          <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            {language === 'ar' ? 'مستمر' : 'Ongoing'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-salus-muted">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{sym.start_date}</span>
                        {sym.duration && <span>({sym.duration})</span>}
                        <button
                          onClick={() => handleDeleteSymptom(sym.id)}
                          className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete symptom"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {sym.notes && (
                      <p className="text-xs text-gray-700 bg-white p-3 rounded-xl border border-gray-100 mb-3 italic">
                        "{sym.notes}"
                      </p>
                    )}

                    {/* Physiotherapy & Functional Markers */}
                    <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                      {sym.impact_balance && (
                        <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                          <Compass className="w-3 h-3" />
                          <span>{language === 'ar' ? 'يؤثر على الاتزان' : 'Balance Impact'}</span>
                        </span>
                      )}
                      {sym.impact_walking && (
                        <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                          <Footprints className="w-3 h-3" />
                          <span>{language === 'ar' ? 'يؤثر على المشي' : 'Walking Impact'}</span>
                        </span>
                      )}
                      {sym.impact_mobility && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          <span>{language === 'ar' ? 'يحد من حركة المفاصل' : 'Mobility Limited'}</span>
                        </span>
                      )}
                      {sym.fatigue_during_activities && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          <span>{language === 'ar' ? 'إجهاد سريع بالمجهود' : 'Exertional Fatigue'}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MY MEDICATIONS */}
      {activeTab === 'meds' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-2xl font-black text-salus-dark-teal">
                {language === 'ar' ? 'قائمة أدويتي الموصوفة' : 'Active Prescriptions'}
              </h2>
              <p className="text-xs text-salus-muted">
                {language === 'ar' ? 'أدويتك المسجلة لمتابعة تفاعلاتها وآثارها الجانبية' : 'Manage your active medications and dosages'}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('search')}
              className="px-4 py-2.5 rounded-xl bg-salus-teal text-white text-xs font-bold shadow-md"
            >
              {language === 'ar' ? '+ إضافة دواء من الدليل' : '+ Add Medication'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {patientMeds.map((med) => (
              <div key={med.id} className="p-5 rounded-2xl bg-salus-bg border border-gray-200/70 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-salus-teal bg-salus-light-mint px-2 py-0.5 rounded">
                      {med.dosage || '5 mg'}
                    </span>
                    <button
                      onClick={async () => {
                        await api.removeActiveMedication(med.id);
                        loadPatientData();
                      }}
                      className="text-gray-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="font-black text-salus-dark-teal text-base">
                    {med.custom_name || med.brand_name_en || med.active_name_en}
                  </h4>
                  <p className="text-xs text-salus-muted mb-2">{med.active_name_en} • {med.active_name_ar}</p>
                  <p className="text-xs text-gray-700 bg-white p-2 rounded-xl border border-gray-100">
                    {med.frequency || 'مرة واحدة يومياً'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MEDICATIONS SEARCH CATALOG */}
      {activeTab === 'search' && <MedicationsView />}

      {/* TAB 5: DOWNLOADABLE & PRINTABLE REPORTS */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-2xl font-black text-salus-dark-teal">
                {language === 'ar' ? 'تقرير سالوس الطبي الشامل' : 'Comprehensive Medical & Symptom Report'}
              </h2>
              <p className="text-xs text-salus-muted">
                {language === 'ar' ? 'تقرير رسمي قابل للتحميل أو الطباعة لعرضه على الصيدلي أو الطبيب' : 'Downloadable PDF or print-ready patient summary'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="/api/reports/download-pdf"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 rounded-2xl bg-salus-teal text-white font-bold text-xs flex items-center gap-2 shadow-md hover:bg-salus-dark-teal transition-all"
              >
                <Download className="w-4 h-4" />
                <span>{t('downloadPdfReport')}</span>
              </a>
              <button
                onClick={() => window.print()}
                className="px-4 py-3 rounded-2xl border border-gray-200 text-salus-text font-bold text-xs hover:bg-salus-bg"
              >
                {t('printReport')}
              </button>
            </div>
          </div>

          {/* Printable Report Preview Card */}
          <div className="p-8 rounded-3xl border-2 border-gray-200 bg-white space-y-6 print:m-0 print:border-none">
            <div className="flex items-center justify-between pb-4 border-b border-salus-teal/30">
              <div className="flex items-center gap-2">
                <Shield className="w-8 h-8 text-salus-teal" />
                <div>
                  <h3 className="text-2xl font-black text-salus-dark-teal">SALUS | سالوس</h3>
                  <p className="text-xs text-salus-muted">Know Your Medicine. Stay Safer.</p>
                </div>
              </div>
              <div className="text-end text-xs text-salus-muted">
                <div>{language === 'ar' ? 'تاريخ التقرير: ' : 'Date: '}{new Date().toLocaleDateString()}</div>
                <div>{language === 'ar' ? 'اسم المريض: ' : 'Patient: '}{user?.displayName}</div>
              </div>
            </div>

            {/* Meds section in report */}
            <div>
              <h4 className="text-sm font-bold text-salus-dark-teal mb-2">
                {language === 'ar' ? 'الأدوية الموصوفة النشطة:' : 'Active Prescriptions:'}
              </h4>
              <div className="space-y-1.5 text-xs text-gray-700">
                {patientMeds.map((m, idx) => (
                  <div key={idx} className="p-2 bg-salus-bg rounded-xl">
                    <span className="font-bold">{idx + 1}. {m.custom_name || m.brand_name_en || m.active_name_en}</span> - {m.frequency || m.dosage}
                  </div>
                ))}
              </div>
            </div>

            {/* Symptoms summary */}
            <div>
              <h4 className="text-sm font-bold text-salus-dark-teal mb-2">
                {language === 'ar' ? 'الأعراض المرصودة وتأثيرها الحركي:' : 'Recorded Symptoms & Mobility Impact:'}
              </h4>
              <div className="space-y-2 text-xs text-gray-700">
                {symptoms.map((s, idx) => (
                  <div key={idx} className="p-3 bg-salus-bg rounded-xl border border-gray-200">
                    <div className="flex justify-between font-bold">
                      <span>{s.symptom_name} ({s.severity})</span>
                      <span>{s.start_date}</span>
                    </div>
                    {s.notes && <p className="text-gray-600 mt-1 italic">"{s.notes}"</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer in report */}
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 leading-relaxed">
              <span className="font-bold block mb-1">{t('criticalDisclaimerTitle')}</span>
              {t('criticalDisclaimer')}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CONNECT WITH PHARMACIST */}
      {activeTab === 'connect' && (
        <div className="space-y-8">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-black text-salus-dark-teal mb-2">{t('generateInviteTitle')}</h2>
            <p className="text-xs text-salus-muted mb-6">
              {language === 'ar'
                ? 'أنشئ كود مشاركة مؤقت لصيدليك المعتمد. الصيدلي لن يستطيع رؤية أي سجل إلا بموافقتك، ويمكنك إلغاء الصلاحية فوراً.'
                : 'Generate a secure, short-lived invitation token for your pharmacist. You retain complete revocation control.'}
            </p>

            <div className="max-w-md space-y-4">
              <div>
                <label className="block text-xs font-bold text-salus-text mb-1">
                  {language === 'ar' ? 'ملاحظة أو رسالة للصيدلي (اختياري)' : 'Consultation Note for Pharmacist'}
                </label>
                <input
                  type="text"
                  value={inviteNotes}
                  onChange={(e) => setInviteNotes(e.target.value)}
                  placeholder="أعاني من تورم بالقدمين ودوخة وأود مراجعة الجرعة..."
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-salus-teal/20 text-xs"
                />
              </div>

              <button
                onClick={handleGenerateInvite}
                className="w-full py-4 rounded-2xl bg-salus-teal text-white font-bold text-sm shadow-xl shadow-salus-teal/20 hover:bg-salus-dark-teal transition-all flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>{t('generateInviteBtn')}</span>
              </button>

              {newInviteCode && (
                <div className="p-5 rounded-2xl bg-salus-light-mint border-2 border-salus-teal text-center space-y-2 animate-fade-in">
                  <div className="text-xs font-bold text-salus-dark-teal">
                    {language === 'ar' ? 'كود المشاركة المؤقت الخاص بك:' : 'Your Temporary Access Token:'}
                  </div>
                  <div className="text-3xl font-black tracking-widest font-mono text-salus-dark-teal select-all">
                    {newInviteCode}
                  </div>
                  <p className="text-[11px] text-salus-muted">
                    {language === 'ar'
                      ? 'أعطِ هذا الكود للصيدلي ليقوم بإدخاله في لوحة تحكم الصيدلي.'
                      : 'Provide this code to your pharmacist to enter in their SALUS dashboard.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Active Grants List */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black text-salus-dark-teal mb-4">{t('activeGrantsTitle')}</h3>
            {grants.length === 0 ? (
              <div className="text-xs text-salus-muted py-6">
                {language === 'ar' ? 'لا توجد أذونات مشاركة نشطة حالياً.' : 'No active consent tokens.'}
              </div>
            ) : (
              <div className="space-y-3">
                {grants.map((g) => (
                  <div key={g.id} className="p-4 rounded-2xl bg-salus-bg border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-salus-dark-teal text-sm">{g.invitation_code}</span>
                        {g.is_revoked ? (
                          <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">
                            {language === 'ar' ? 'ملغي' : 'Revoked'}
                          </span>
                        ) : g.isExpired ? (
                          <span className="text-[10px] bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded">
                            {language === 'ar' ? 'منتهي الصلاحية' : 'Expired'}
                          </span>
                        ) : (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                            {language === 'ar' ? 'نشط' : 'Active'}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-salus-muted mt-1">
                        {g.pharmacist_name ? `الصيدلي: ${g.pharmacist_name}` : 'في انتظار ربط الصيدلي'} • ينتهي: {new Date(g.expires_at).toLocaleDateString()}
                      </div>
                    </div>

                    {!g.is_revoked && !g.isExpired && (
                      <button
                        onClick={() => handleRevokeGrant(g.id)}
                        className="px-4 py-2 rounded-xl bg-white border border-rose-300 text-rose-700 font-bold text-xs hover:bg-rose-50 transition-colors"
                      >
                        {t('revokeAccessBtn')}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Modals */}
      <VoiceAssistantModal
        isOpen={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onOpenSymptomLogger={(sym) => {
          setSymptomName(sym);
          setVoiceOpen(false);
          setActiveTab('overview');
        }}
      />

      <ScanMedicationModal
        isOpen={scanOpen}
        onClose={() => setScanOpen(false)}
        onConfirmMedication={(medId, brand) => {
          setSelectedMedId(medId);
          setActiveTab('search');
        }}
      />

      <SafetyAlertModal alert={activeAlert} onClose={() => setActiveAlert(null)} />
    </div>
  );
};
