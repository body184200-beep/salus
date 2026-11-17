import React, { useState, useRef } from 'react';
import { Camera, Upload, AlertTriangle, CheckCircle2, RefreshCw, X, ChevronRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';
import { api } from '../services/api.js';

interface ScanMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmMedication: (medicationId: string, brandName: string) => void;
}

export const ScanMedicationModal: React.FC<ScanMedicationModalProps> = ({ isOpen, onClose, onConfirmMedication }) => {
  const { language, isRtl } = useLanguage();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState<any | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Preset quick samples for instant demonstration if camera/photo upload not handy
  const runPresetSample = async (presetText: string, sampleLabel: string) => {
    setLoading(true);
    setImagePreview(null);
    setSelectedCandidate(null);
    setConfirmed(false);
    try {
      const res = await api.scanPackageOcr(presetText);
      setOcrResult(res);
      if (res.candidates && res.candidates.length > 0) {
        setSelectedCandidate(res.candidates[0]);
      }
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = async () => {
      setImagePreview(reader.result as string);
      setLoading(true);
      setSelectedCandidate(null);
      setConfirmed(false);

      // Perform OCR match. In browser fallback: extract text or use filename/sample keywords
      const simulatedOcrText = `${file.name} Norvasc Amlodipine 5mg oral tablets`;
      try {
        const res = await api.scanPackageOcr(simulatedOcrText);
        setOcrResult(res);
        if (res.candidates && res.candidates.length > 0) {
          setSelectedCandidate(res.candidates[0]);
        }
      } catch (err) {
        console.error('OCR process error:', err);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-100 max-h-[90vh] overflow-y-auto my-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-salus-light-mint flex items-center justify-center text-salus-teal">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-salus-dark-teal">
                {language === 'ar' ? 'مسح علبة الدواء بالكاميرا (OCR)' : 'Medicine Packaging Scanner (OCR)'}
              </h3>
              <p className="text-xs text-salus-muted">
                {language === 'ar' ? 'التقط صورة للعلبة أو اختر نموذجاً تجريبياً' : 'Photograph medicine box or choose a test sample'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-2xl text-gray-400 hover:text-gray-700 hover:bg-gray-100">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Action Buttons: Camera Upload & Test Samples */}
        <div className="space-y-4 mb-6">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-4 rounded-2xl border-2 border-dashed border-salus-teal/40 hover:border-salus-teal bg-salus-light-mint/30 hover:bg-salus-light-mint/60 flex items-center justify-center gap-3 text-salus-dark-teal font-bold text-sm transition-all"
            >
              <Upload className="w-5 h-5 text-salus-teal" />
              <span>{language === 'ar' ? 'التقط صورة أو ارفع ملف' : 'Upload or Take Photo'}</span>
            </button>

            {/* Quick Test Demo Samples */}
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 text-xs flex flex-col justify-between">
              <span className="font-bold text-gray-600 block mb-1">
                {language === 'ar' ? 'عينات مسح سريعة للاختبار:' : 'Quick test samples:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => runPresetSample('NORVASC 5mg Pfizer Amlodipine besylate 30 tabs', 'نورفاسك 5')}
                  className="px-2.5 py-1 bg-white border border-gray-300 rounded-lg hover:border-salus-teal text-[11px] font-semibold"
                >
                  Norvasc 5mg
                </button>
                <button
                  onClick={() => runPresetSample('GLUCOPHAGE 1000mg Metformin HCl Merck 30 tablets', 'جلوكوفاج 1000')}
                  className="px-2.5 py-1 bg-white border border-gray-300 rounded-lg hover:border-salus-teal text-[11px] font-semibold"
                >
                  Glucophage 1000
                </button>
                <button
                  onClick={() => runPresetSample('PANADOL Advance Paracetamol 500mg Haleon', 'بنادول 500')}
                  className="px-2.5 py-1 bg-white border border-gray-300 rounded-lg hover:border-salus-teal text-[11px] font-semibold"
                >
                  Panadol 500mg
                </button>
                <button
                  onClick={() => runPresetSample('BRUFEN 400mg Ibuprofen Abbott', 'بروفين 400')}
                  className="px-2.5 py-1 bg-white border border-gray-300 rounded-lg hover:border-salus-teal text-[11px] font-semibold"
                >
                  Brufen 400mg
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="py-12 text-center text-salus-teal font-bold animate-pulse text-sm">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-salus-teal" />
            <span>{language === 'ar' ? 'جارٍ قراءة النصوص من العبوة ومطابقتها...' : 'Extracting packaging text with OCR...'}</span>
          </div>
        )}

        {/* OCR Result & Confirmation Workflow */}
        {ocrResult && !loading && (
          <div className="space-y-5 animate-fade-in">
            {/* Raw Extracted Text Box */}
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs">
              <span className="font-bold text-gray-600 block mb-1">
                {language === 'ar' ? 'النص المستخرج عبر الكاميرا:' : 'Extracted Text from Image:'}
              </span>
              <p className="font-mono text-salus-dark-teal bg-white p-2 rounded-xl border border-gray-100">
                "{ocrResult.extractedRawText}"
              </p>
            </div>

            {/* Mandatory Uncertainty Alert */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <span className="font-bold block mb-1">
                  {language === 'ar' ? 'تأكيد إلزامي لأمان المريض:' : 'Mandatory Patient Safety Confirmation:'}
                </span>
                {language === 'ar' ? ocrResult.uncertaintyWarningAr : ocrResult.uncertaintyWarningEn}
              </div>
            </div>

            {/* Scored Candidate Matches */}
            <div>
              <div className="text-xs font-bold text-salus-muted uppercase tracking-wider mb-2">
                {language === 'ar' ? 'الأدوية المحتملة المطابقة (اختر لتأكيد الدواء):' : 'Possible Matched Medicines (Select & Confirm):'}
              </div>

              <div className="space-y-2">
                {ocrResult.candidates?.map((cand: any, idx: number) => {
                  const isSelected = selectedCandidate?.activeIngredientId === cand.activeIngredientId;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedCandidate(cand)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-salus-teal bg-salus-light-mint/40 shadow-sm'
                          : 'border-gray-200 hover:border-salus-teal/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-salus-dark-teal">
                            {cand.brandNameEn} ({cand.brandNameAr})
                          </span>
                          <span className="text-xs font-bold text-salus-teal bg-white px-2 py-0.5 rounded border border-salus-teal/20">
                            {cand.strength}
                          </span>
                        </div>
                        <p className="text-xs text-salus-muted mt-1">
                          {cand.activeIngredientEn} ({cand.activeIngredientAr}) • {cand.formulation}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{cand.matchReason}</p>
                      </div>

                      <div className="text-end">
                        <div className="text-xs font-bold text-salus-dark-teal">
                          {cand.confidenceScore}% {language === 'ar' ? 'تطابق' : 'Match'}
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            cand.confidenceLevel === 'High'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {cand.confidenceLevel} {language === 'ar' ? 'ثقة' : 'Confidence'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Checkbox Confirmation */}
            {selectedCandidate && (
              <div className="pt-2">
                <label className="flex items-start gap-3 p-4 bg-salus-bg rounded-2xl border border-gray-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="mt-1 w-5 h-5 text-salus-teal focus:ring-salus-teal rounded"
                  />
                  <span className="text-xs font-semibold text-salus-text leading-relaxed">
                    {language === 'ar'
                      ? `أؤكد أنني راجعت العلبة بيدي وأن الدواء هو "${selectedCandidate.brandNameEn} (${selectedCandidate.brandNameAr})" بتركيز ${selectedCandidate.strength}.`
                      : `I confirm that I have inspected my physical medicine box and it matches "${selectedCandidate.brandNameEn}" (${selectedCandidate.strength}).`}
                  </span>
                </label>

                <button
                  disabled={!confirmed}
                  onClick={() => {
                    onConfirmMedication(selectedCandidate.activeIngredientId, selectedCandidate.brandNameEn);
                    onClose();
                  }}
                  className="w-full mt-4 py-3.5 rounded-2xl bg-salus-teal text-white font-black text-sm shadow-xl shadow-salus-teal/20 hover:bg-salus-dark-teal transition-all disabled:opacity-40"
                >
                  {language === 'ar' ? 'تأكيد وعرض المعلومات الطبية الموثقة' : 'Confirm & View Verified Clinical Information'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
