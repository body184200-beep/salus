import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  AlertTriangle,
  FileCheck,
  BookOpen,
  Info,
  ExternalLink,
  ChevronRight,
  Shield,
  Clock,
  Users,
  CheckCircle2,
  X,
  Volume2,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';
import { api } from '../services/api.js';

export const MedicationsView: React.FC = () => {
  const { language, t, isRtl } = useLanguage();

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [medications, setMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Monograph Modal
  const [selectedMedId, setSelectedMedId] = useState<string | null>(null);
  const [medDetail, setMedDetail] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    loadCategories();
    performSearch();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await api.getCategories();
      if (res.categories) setCategories(res.categories);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const performSearch = async (query = searchQuery, category = selectedCategory) => {
    setLoading(true);
    try {
      const res = await api.searchMedications(query, category);
      if (res.results) {
        setMedications(res.results);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openMedDetail = async (id: string) => {
    setSelectedMedId(id);
    setLoadingDetail(true);
    try {
      const res = await api.getMedicationDetails(id);
      if (res.medication) {
        setMedDetail(res.medication);
      }
    } catch (err) {
      console.error('Error fetching details:', err);
    } finally {
      setLoadingDetail(false);
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
    <div className="space-y-8">
      {/* Search Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
        <h2 className="text-2xl font-black text-salus-dark-teal mb-2">
          {language === 'ar' ? 'دليل الأدوية والآثار الجانبية الموثقة' : 'Verified Medication & Adverse Effects Catalog'}
        </h2>
        <p className="text-xs sm:text-sm text-salus-muted mb-6">
          {language === 'ar'
            ? 'ابحث بالاسم العلمي، الاسم بالعربي، أو الاسم التجاري المسجل في مصر (مثل: نورفاسك، كونكور، جلوكوفاج، بنادول، بروفين، كتافلام)'
            : 'Search by generic name, Arabic name, or verified Egyptian brand (e.g., Norvasc, Concor, Glucophage, Panadol, Brufen, Cataflam)'}
        </p>

        {/* Input Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-4' : 'left-4'} w-5 h-5 text-gray-400`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                performSearch(e.target.value, selectedCategory);
              }}
              placeholder={language === 'ar' ? 'اكتب اسم الدواء أو المادة الفعالة...' : 'Search generic or brand name...'}
              className={`w-full py-3.5 ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-salus-teal/20 focus:border-salus-teal text-sm`}
            />
          </div>

          {/* Category Filter */}
          <div className="sm:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                performSearch(searchQuery, e.target.value);
              }}
              className="w-full py-3.5 px-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-salus-teal/20 focus:border-salus-teal text-sm bg-white"
            >
              <option value="">{language === 'ar' ? 'جميع الفئات العلاجية' : 'All Categories'}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {language === 'ar' ? c.name_ar : c.name_en}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {medications.map((item) => (
          <div
            key={item.ingredient_id}
            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-salus-teal bg-salus-light-mint px-2.5 py-1 rounded-lg">
                  {language === 'ar' ? item.category_name_ar : item.category_name_en}
                </span>

                {item.ingredient_id === 'ing-paracetamol' ? (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    Non-NSAID
                  </span>
                ) : item.is_nsaid ? (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                    NSAID
                  </span>
                ) : null}
              </div>

              {/* Names */}
              <h3 className="text-lg font-black text-salus-dark-teal">
                {language === 'ar' ? item.generic_name_ar : item.generic_name_en}
              </h3>
              <p className="text-xs text-salus-muted font-medium mb-3">
                {language === 'ar' ? item.generic_name_en : item.generic_name_ar} • {language === 'ar' ? item.drug_class_ar : item.drug_class_en}
              </p>

              {/* Purpose */}
              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4">
                {language === 'ar' ? item.general_purpose_ar : item.general_purpose_en}
              </p>

              {/* Egyptian Brands Preview */}
              <div className="mb-4">
                <div className="text-[11px] font-bold text-gray-500 mb-1.5">
                  {language === 'ar' ? 'الأسماء المسجلة في مصر (EDA):' : 'Egyptian Registered Brands (EDA):'}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {item.egyptianProducts?.slice(0, 3).map((p: any) => (
                    <span key={p.id} className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-medium">
                      {p.brand_name_en} ({p.strength})
                    </span>
                  ))}
                  {item.egyptianProducts?.length > 3 && (
                    <span className="text-[10px] text-salus-muted self-center">
                      +{item.egyptianProducts.length - 3} {language === 'ar' ? 'آخرين' : 'more'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => openMedDetail(item.ingredient_id)}
              className="w-full mt-4 py-3 rounded-2xl bg-salus-bg text-salus-dark-teal font-bold text-xs hover:bg-salus-light-mint border border-gray-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>{language === 'ar' ? 'عرض الآثار الجانبية والأدلة' : 'View Clinical Evidence & Side Effects'}</span>
              <ChevronRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </div>
        ))}
      </div>

      {medications.length === 0 && !loading && (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
          <Info className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800 mb-1">
            {language === 'ar' ? 'لم يتم العثور على أدوية مطابقة' : 'No matching medications found'}
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            {language === 'ar'
              ? 'تغطي المنصة حالياً 9 مواد فعالة موثقة لضغط الدم والسكري وتسكين الألم. يرجى تجربة اسم آخر أو اختيار فئة.'
              : 'SALUS currently covers 9 initial verified ingredients. Try searching another term or category.'}
          </p>
        </div>
      )}

      {/* DETAILED MONOGRAPH MODAL */}
      {selectedMedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto my-8 border border-gray-100">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-salus-teal bg-salus-light-mint px-2 py-0.5 rounded">
                    {medDetail ? (language === 'ar' ? medDetail.category_name_ar : medDetail.category_name_en) : ''}
                  </span>
                  {medDetail?.id === 'ing-paracetamol' && (
                    <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      Non-NSAID
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-black text-salus-dark-teal">
                  {medDetail ? (language === 'ar' ? `${medDetail.name_ar} (${medDetail.name_en})` : `${medDetail.name_en} (${medDetail.name_ar})`) : '...'}
                </h2>
                <p className="text-xs text-salus-muted">
                  {medDetail ? (language === 'ar' ? medDetail.drug_class_ar : medDetail.drug_class_en) : ''}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const text = language === 'ar'
                      ? `${medDetail.name_ar}. ${medDetail.general_purpose_ar}. تحذير: ${medDetail.warnings_ar}`
                      : `${medDetail.name_en}. ${medDetail.general_purpose_en}. Warning: ${medDetail.warnings_en}`;
                    speakText(text);
                  }}
                  className="p-2.5 rounded-2xl bg-salus-light-mint text-salus-teal hover:bg-salus-teal hover:text-white transition-colors"
                  title="Spoken Explanation / استمع للشرح"
                >
                  <Volume2 className="w-5 h-5" />
                </button>

                <button
                  onClick={() => {
                    setSelectedMedId(null);
                    setMedDetail(null);
                  }}
                  className="p-2.5 rounded-2xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {loadingDetail ? (
              <div className="py-20 text-center text-salus-muted">Loading clinical monograph...</div>
            ) : medDetail ? (
              <div className="space-y-6">
                {/* General Purpose */}
                <div>
                  <h4 className="text-xs font-bold text-salus-muted uppercase tracking-wider mb-1">
                    {language === 'ar' ? 'الاستخدام العلاجي المصرح به:' : 'Approved Clinical Indication:'}
                  </h4>
                  <p className="text-sm font-semibold text-gray-800 leading-relaxed">
                    {language === 'ar' ? medDetail.general_purpose_ar : medDetail.general_purpose_en}
                  </p>
                </div>

                {/* Important Warnings Box */}
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                  <div className="flex items-center gap-2 text-rose-800 font-bold text-xs mb-1">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{language === 'ar' ? 'تحذيرات هامة وموانع استخدام:' : 'Critical Boxed Warnings & Precautions:'}</span>
                  </div>
                  <p className="text-xs text-rose-950 leading-relaxed font-medium">
                    {language === 'ar' ? medDetail.warnings_ar : medDetail.warnings_en}
                  </p>
                </div>

                {/* Verified Egyptian Products */}
                <div>
                  <h4 className="text-xs font-bold text-salus-muted uppercase tracking-wider mb-2">
                    {language === 'ar' ? 'المستحضرات والأسماء التجارية المسجلة في مصر (EDA):' : 'Verified Registered Egyptian Products (EDA):'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {medDetail.egyptianProducts?.map((p: any) => (
                      <div key={p.id} className="p-3 rounded-2xl bg-salus-bg border border-gray-200/60 flex flex-col justify-between">
                        <div className="flex items-center justify-between font-bold text-salus-dark-teal">
                          <span>{p.brand_name_en} ({p.brand_name_ar})</span>
                          <span className="text-salus-teal">{p.strength}</span>
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1">
                          {p.formulation} • {p.manufacturer} • {p.eda_registration_no}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Adverse Effects Clinical Evidence Table (Zero invented rates!) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-salus-muted uppercase tracking-wider">
                      {language === 'ar' ? 'الآثار الجانبية الموثقة إكلينيكياً (نسب حقيقية):' : 'Documented Adverse Events (True Clinical Trial Rates):'}
                    </h4>
                    <span className="text-[10px] text-salus-teal font-bold bg-salus-light-mint px-2 py-0.5 rounded">
                      DailyMed & Trial Registry
                    </span>
                  </div>

                  <div className="space-y-3">
                    {medDetail.adverseEffects?.map((ae: any) => (
                      <div key={ae.id} className="p-4 rounded-2xl bg-white border border-gray-200/70 shadow-sm space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-black text-sm text-salus-dark-teal">
                              {language === 'ar' ? ae.name_ar : ae.name_en}
                            </span>
                            <span className="text-xs text-salus-muted block">
                              {language === 'ar' ? ae.name_en : ae.name_ar}
                            </span>
                          </div>
                          <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-teal-50 text-salus-teal border border-salus-teal/20">
                            {language === 'ar' ? ae.frequency_display_ar : ae.frequency_display_en}
                          </span>
                        </div>

                        <p className="text-xs text-gray-700 leading-relaxed">
                          {language === 'ar' ? ae.description_ar : ae.description_en}
                        </p>

                        {/* Evidence Meta */}
                        <div className="pt-2 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-500">
                          <div>
                            <span className="font-bold text-gray-700">{language === 'ar' ? 'الدراسة / المصدر: ' : 'Source Trial: '}</span>
                            {ae.source_study_or_label}
                          </div>
                          <div>
                            <span className="font-bold text-gray-700">{language === 'ar' ? 'العينة / المقارن: ' : 'Cohort: '}</span>
                            {ae.sampleSize} • {ae.comparator}
                          </div>
                          <div>
                            <span className="font-bold text-gray-700">{language === 'ar' ? 'وقت البدء: ' : 'Onset: '}</span>
                            {language === 'ar' ? ae.time_to_onset_ar : ae.time_to_onset_en}
                          </div>
                          <div>
                            <span className="font-bold text-gray-700">{language === 'ar' ? 'المدة: ' : 'Duration: '}</span>
                            {language === 'ar' ? ae.duration_ar : ae.duration_en}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Drug Interactions */}
                <div>
                  <h4 className="text-xs font-bold text-salus-muted uppercase tracking-wider mb-1">
                    {language === 'ar' ? 'التداخلات الدوائية الهامة:' : 'Key Drug Interactions:'}
                  </h4>
                  <p className="text-xs text-gray-700 leading-relaxed p-3.5 rounded-2xl bg-gray-50 border border-gray-200">
                    {language === 'ar' ? medDetail.interactions_ar : medDetail.interactions_en}
                  </p>
                </div>

                {/* Verification Metadata Footer */}
                <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center text-[11px] text-salus-muted gap-2">
                  <span>{language === 'ar' ? 'تاريخ آخر تدقيق إكلينيكي: ' : 'Last Reviewed Date: '}{medDetail.last_reviewed_date}</span>
                  <span className="font-bold text-salus-teal flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {language === 'ar' ? 'تمت المراجعة من هيئة الصيادلة الإكلينيكيين' : 'Audited by Clinical Pharmacy Board'}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
