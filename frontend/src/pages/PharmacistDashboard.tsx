import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
  Search,
  FileText,
  Clock,
  CheckCircle,
  Plus,
  Send,
  Eye,
  Activity,
  Heart,
  Calendar,
  AlertOctagon,
  HelpCircle,
  X,
  FileCheck2,
  Lock,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { MedicationsView } from '../components/MedicationsView.js';

export const PharmacistDashboard: React.FC = () => {
  const { language, t, isRtl } = useLanguage();
  const { user } = useAuth();

  const isVerified = user?.pharmacistVerificationStatus === 'verified';

  // Navigation sub-tabs
  const [tab, setTab] = useState<'queue' | 'review' | 'catalog'>('queue');

  // Input code
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connectMsg, setConnectMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Active cases queue
  const [cases, setCases] = useState<any[]>([]);
  const [loadingCases, setLoadingCases] = useState(false);

  // Selected Patient Case
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [patientRecords, setPatientRecords] = useState<any | null>(null);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // Clinical Consultation Note Form
  const [clinicalNote, setClinicalNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteSavedMsg, setNoteSavedMsg] = useState(false);

  useEffect(() => {
    if (isVerified) {
      loadCases();
    }
  }, [isVerified]);

  const loadCases = async () => {
    setLoadingCases(true);
    try {
      const res = await api.getPharmacistCases();
      if (res.cases) setCases(res.cases);
    } catch (err) {
      console.error('Failed to load cases:', err);
    } finally {
      setLoadingCases(false);
    }
  };

  const handleConnectPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;

    setConnecting(true);
    setConnectMsg(null);
    try {
      const res = await api.acceptPatientInvite(inviteCodeInput.trim());
      if (res.grantId) {
        setConnectMsg({
          type: 'success',
          text: language === 'ar' ? 'تم ربط ملف المريض بنجاح بموجب الموافقة المعتمدة.' : 'Patient record connected successfully.',
        });
        setInviteCodeInput('');
        loadCases();
      } else {
        setConnectMsg({
          type: 'error',
          text: language === 'ar' ? res.errorAr || res.error : res.error,
        });
      }
    } catch (err) {
      setConnectMsg({
        type: 'error',
        text: 'Failed to connect. Please verify the code or server connection.',
      });
    } finally {
      setConnecting(false);
    }
  };

  const openPatientReview = async (caseItem: any) => {
    setSelectedCase(caseItem);
    setTab('review');
    setLoadingRecords(true);
    setClinicalNote(caseItem.pharmacist_notes || '');
    setNoteSavedMsg(false);

    try {
      const res = await api.getPatientRecords(caseItem.patient_id);
      setPatientRecords(res);
    } catch (err) {
      console.error('Error fetching patient records:', err);
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleSaveClinicalNote = async () => {
    if (!selectedCase || !clinicalNote.trim()) return;

    setSavingNote(true);
    try {
      await api.saveClinicalNote(selectedCase.id, clinicalNote, 'completed');
      setNoteSavedMsg(true);
      loadCases();
      setTimeout(() => setNoteSavedMsg(false), 4000);
    } catch (err) {
      console.error('Error saving clinical note:', err);
    } finally {
      setSavingNote(false);
    }
  };

  // If Pharmacist is PENDING verification
  if (!isVerified) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-8 sm:p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-amber-950">
            {language === 'ar' ? 'حساب الصيدلي قيد التحقق المهني' : 'Pharmacist Syndicate Verification Pending'}
          </h2>
          <p className="text-sm text-amber-900 leading-relaxed max-w-lg mx-auto">
            {language === 'ar'
              ? 'وفقاً لبروتوكول الأمان الدوائي في سالوس، لا تُمنح الصلاحيات السريرية والاطلاع على بيانات المرضى إلا بعد التحقق من ترخيص مزاولة المهنة المعتمد من نقابة الصيادلة المصرية.'
              : 'Per SALUS clinical safety protocol, professional privileges and patient data access are locked until syndicate registration is verified.'}
          </p>
          <div className="p-4 bg-white/80 rounded-2xl border border-amber-200 text-xs text-amber-800 font-mono inline-block">
            {language === 'ar' ? 'حالة الحساب: ' : 'Account Status: '}
            <span className="font-bold uppercase tracking-wider text-amber-700">Pending Review (قيد المراجعة)</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Verified Professional Identity Banner */}
      <div className="bg-gradient-to-r from-salus-dark-teal to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-300 shadow-md">
            <Stethoscope className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold bg-emerald-400 text-salus-dark-teal px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t('pharmVerifiedBadge')}</span>
              </span>
              <span className="text-xs text-salus-light-mint">نقابة صيادلة مصر: SYN-44219</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black">{user?.displayName || 'د. مريم فاروق - صيدلي إكلينيكي'}</h1>
            <p className="text-xs text-salus-light-mint/80">
              صيدلية النيل الحديثة - المعادي، القاهرة • رخصة مزاولة المهنة: EGY-PH-84920
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setTab('queue')}
            className={`px-4 py-2 rounded-xl transition-all ${
              tab === 'queue' ? 'bg-white text-salus-dark-teal shadow' : 'text-salus-light-mint hover:text-white'
            }`}
          >
            {language === 'ar' ? 'قائمة الحالات السريرية' : 'Case Queue'}
          </button>
          <button
            onClick={() => setTab('catalog')}
            className={`px-4 py-2 rounded-xl transition-all ${
              tab === 'catalog' ? 'bg-white text-salus-dark-teal shadow' : 'text-salus-light-mint hover:text-white'
            }`}
          >
            {language === 'ar' ? 'دليل الأدوية والتفاعلات' : 'Drug Monograph'}
          </button>
        </div>
      </div>

      {/* TAB 1: CASE QUEUE & PATIENT CONNECTION */}
      {tab === 'queue' && (
        <div className="space-y-8">
          {/* Connect Patient Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black text-salus-dark-teal mb-2">
              {language === 'ar' ? 'ربط ملف مريض جديد برمز المشاركة' : 'Connect Patient via Share Token'}
            </h3>
            <p className="text-xs text-salus-muted mb-4">
              {language === 'ar'
                ? 'أدخل الكود السري الذي زوّدك به المريض للاطلاع على سجل الأعراض المأذون به فقط.'
                : 'Enter the secure authorization code provided by the patient to access consented records.'}
            </p>

            <form onSubmit={handleConnectPatient} className="flex flex-col sm:flex-row gap-3 max-w-xl">
              <input
                type="text"
                required
                value={inviteCodeInput}
                onChange={(e) => setInviteCodeInput(e.target.value)}
                placeholder="SALUS-XXXX-XXXX"
                className="flex-1 px-4 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-salus-teal/20 focus:border-salus-teal font-mono uppercase text-sm"
              />
              <button
                type="submit"
                disabled={connecting}
                className="px-6 py-3.5 rounded-2xl bg-salus-teal text-white font-bold text-sm shadow-md hover:bg-salus-dark-teal transition-all disabled:opacity-40"
              >
                {connecting ? '...' : t('pharmConnectBtn')}
              </button>
            </form>

            {connectMsg && (
              <div
                className={`mt-4 p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                  connectMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {connectMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>{connectMsg.text}</span>
              </div>
            )}
          </div>

          {/* Active Cases Table */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-salus-dark-teal">{t('pharmActiveCases')}</h3>
                <p className="text-xs text-salus-muted">
                  {language === 'ar' ? 'حالات المتابعة الدوائية النشطة والمصرح بها من المرضى' : 'Consented patient follow-up cases'}
                </p>
              </div>
              <span className="text-xs font-bold bg-salus-light-mint text-salus-teal px-3 py-1 rounded-full">
                {cases.length} {language === 'ar' ? 'حالات' : 'Cases'}
              </span>
            </div>

            {loadingCases ? (
              <div className="py-12 text-center text-xs text-salus-muted">Loading cases...</div>
            ) : cases.length === 0 ? (
              <div className="py-12 text-center text-xs text-salus-muted">
                {t('pharmNoCases')}
              </div>
            ) : (
              <div className="space-y-3">
                {cases.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl bg-salus-bg border border-gray-200/70 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-base text-salus-dark-teal">{c.patient_name}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            c.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.status === 'in_review'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {c.status.toUpperCase()}
                        </span>
                        {c.active_alerts_count > 0 && (
                          <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded flex items-center gap-1">
                            <AlertOctagon className="w-3 h-3 text-rose-600" />
                            <span>{c.active_alerts_count} إنذارات طارئة</span>
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-salus-muted space-x-2 rtl:space-x-reverse">
                        <span>{c.total_symptoms_count} أعراض مسجلة</span>
                        <span>•</span>
                        <span>نطاق التفويض: {c.scope}</span>
                        <span>•</span>
                        <span>ينتهي: {new Date(c.expires_at).toLocaleDateString()}</span>
                      </div>

                      {c.patient_notes && (
                        <p className="text-xs text-gray-700 mt-2 bg-white p-2.5 rounded-xl border border-gray-100 italic">
                          "طلب المريض: {c.patient_notes}"
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => openPatientReview(c)}
                      className="px-5 py-2.5 rounded-xl bg-salus-teal text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow hover:bg-salus-dark-teal transition-all shrink-0"
                    >
                      <Eye className="w-4 h-4" />
                      <span>{t('pharmReviewBtn')}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DETAILED CASE CLINICAL REVIEW */}
      {tab === 'review' && selectedCase && (
        <div className="space-y-8 animate-fade-in">
          {/* Back button */}
          <button
            onClick={() => setTab('queue')}
            className="text-xs font-bold text-salus-teal hover:underline flex items-center gap-1"
          >
            <span>&larr; {language === 'ar' ? 'العودة لقائمة الحالات' : 'Back to Case Queue'}</span>
          </button>

          {/* Patient Overview Header */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-salus-muted mb-1">
                <span>{language === 'ar' ? 'ملف المريض المأذون به سريرياً' : 'Consented Clinical Patient Profile'}</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Consent Active</span>
                </span>
              </div>
              <h2 className="text-2xl font-black text-salus-dark-teal">{selectedCase.patient_name}</h2>
              <div className="text-xs text-gray-600 mt-1">
                الفئة العمرية: {patientRecords?.patient?.ageRange || 'غير محدد'} • جهة اتصال الطوارئ: {patientRecords?.patient?.emergencyContact || 'غير متوفر'}
              </div>
            </div>

            <div className="text-xs text-salus-muted p-3 bg-salus-bg rounded-2xl border border-gray-200">
              <div className="font-bold text-salus-dark-teal">تفويض المشاركة:</div>
              <div>كود: {selectedCase.invitation_code || 'SALUS-CONSENT'}</div>
              <div>ينتهي: {new Date(selectedCase.expires_at).toLocaleDateString()}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Authorized Meds & Symptom History */}
            <div className="lg:col-span-2 space-y-8">
              {/* Prescriptions */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
                <h4 className="text-base font-black text-salus-dark-teal mb-3 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-salus-teal" />
                  <span>{language === 'ar' ? 'الأدوية الموصوفة للمريض' : 'Patient Active Prescriptions'}</span>
                </h4>

                <div className="space-y-2">
                  {patientRecords?.medications?.map((m: any) => (
                    <div key={m.id} className="p-3.5 bg-salus-bg rounded-2xl border border-gray-200 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-black text-salus-dark-teal">
                          {m.brand_name_en || m.custom_name || m.active_name_en} ({m.dosage})
                        </div>
                        <div className="text-salus-muted">{m.active_name_en} • {m.drug_class_en}</div>
                        <div className="text-gray-600 mt-0.5">{m.frequency}</div>
                      </div>
                      <span className="text-[10px] font-bold bg-white text-salus-teal px-2 py-1 rounded border">
                        {m.is_nsaid ? 'NSAID' : 'Active'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reported Symptoms with Physiotherapy Functional Markers */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
                <h4 className="text-base font-black text-salus-dark-teal mb-3 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500" />
                  <span>{language === 'ar' ? 'الأعراض المرصودة من المريض والعلامات الحركية' : 'Reported Symptoms & Mobility Markers'}</span>
                </h4>

                <div className="space-y-3">
                  {patientRecords?.symptoms?.map((s: any) => (
                    <div key={s.id} className="p-4 rounded-2xl bg-salus-bg border border-gray-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-salus-dark-teal">{s.symptom_name}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              s.severity === 'severe'
                                ? 'bg-rose-100 text-rose-800'
                                : s.severity === 'moderate'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {s.severity.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs text-salus-muted">{s.start_date}</span>
                      </div>

                      {s.notes && (
                        <p className="text-xs text-gray-700 bg-white p-2.5 rounded-xl border border-gray-100 italic">
                          "ملاحظة المريض: {s.notes}"
                        </p>
                      )}

                      {/* Physiotherapy impact display */}
                      <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                        {s.impact_balance && (
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-800 rounded border border-rose-200">
                            تأثر الاتزان (Balance Impact)
                          </span>
                        )}
                        {s.impact_walking && (
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-800 rounded border border-rose-200">
                            تأثر المشي (Gait / Walking Impact)
                          </span>
                        )}
                        {s.impact_mobility && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded border border-amber-200">
                            تأثر الحركة المفصلية (Mobility Restriction)
                          </span>
                        )}
                        {s.fatigue_during_activities && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded border border-amber-200">
                            إجهاد المجهود البدني (Exertional Fatigue)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Pharmacist Clinical Consultation Note Form */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-salus-dark-teal font-black text-base">
                  <FileCheck2 className="w-5 h-5 text-salus-teal" />
                  <span>{t('pharmWriteNote')}</span>
                </div>

                <p className="text-xs text-salus-muted leading-relaxed">
                  {language === 'ar'
                    ? 'سجّل تقييمك السريري، توجيهات الجرعة، أو التوصية بمراجعة الطبيب لتعديل الدواء. ستظهر هذه الملاحظة في تقرير المريض الرسمي.'
                    : 'Record your verified clinical assessment. This note will appear on the patient’s formal report.'}
                </p>

                <textarea
                  rows={6}
                  value={clinicalNote}
                  onChange={(e) => setClinicalNote(e.target.value)}
                  placeholder="مثال: تمت مراجعة تورم الكاحلين، وهو متوافق مع الآثار الجانبية للأملوديبين (10.8%). تم توجيه المريض بعدم إيقاف الدواء ومراجعة الطبيب لاحتمالية تقليل الجرعة أو إضافة ARB..."
                  className="w-full p-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-salus-teal/20 focus:border-salus-teal text-xs leading-relaxed"
                />

                <button
                  onClick={handleSaveClinicalNote}
                  disabled={savingNote || !clinicalNote.trim()}
                  className="w-full py-3.5 rounded-2xl bg-salus-teal text-white font-bold text-xs shadow-md hover:bg-salus-dark-teal transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{savingNote ? '...' : t('pharmCompleteFollowUp')}</span>
                </button>

                {noteSavedMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>تم حفظ الملاحظة الإكلينيكية واعتماد الحالة بنجاح.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DRUG MONOGRAPHS & INTERACTIONS */}
      {tab === 'catalog' && <MedicationsView />}
    </div>
  );
};
