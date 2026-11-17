import 'package:flutter/material.dart';
import '../providers/app_state.dart';
import '../theme/salus_theme.dart';
import '../widgets/emergency_dialog.dart';
import 'voice_assistant_sheet.dart';
import 'package_scanner_sheet.dart';
import 'medication_search_screen.dart';

class PatientDashboard extends StatefulWidget {
  final AppState state;

  const PatientDashboard({super.key, required this.state});

  @override
  State<PatientDashboard> createState() => _PatientDashboardState();
}

class _PatientDashboardState extends State<PatientDashboard> {
  int _currentTab = 0; // 0: Overview/Log, 1: Timeline, 2: Prescriptions, 3: Consent & Pharmacist, 4: Report

  // Symptom Form State
  final _symptomNameController = TextEditingController();
  final _notesController = TextEditingController();
  String _selectedSeverity = 'moderate';
  String _duration = '3 days';
  bool _isOngoing = true;
  bool _impactDaily = false;
  bool _impactBalance = false;
  bool _impactWalking = false;
  bool _impactMobility = false;
  bool _fatigue = false;
  String? _selectedMedName;

  void _submitSymptom() {
    if (_symptomNameController.text.trim().isEmpty) return;

    final result = widget.state.addSymptom(
      name: _symptomNameController.text.trim(),
      medName: _selectedMedName,
      severity: _selectedSeverity,
      duration: _duration,
      isOngoing: _isOngoing,
      impactDaily: _impactDaily,
      impactBalance: _impactBalance,
      impactWalking: _impactWalking,
      impactMobility: _impactMobility,
      fatigue: _fatigue,
      notes: _notesController.text.trim(),
    );

    _symptomNameController.clear();
    _notesController.clear();
    setState(() {
      _impactBalance = false;
      _impactWalking = false;
      _impactMobility = false;
      _fatigue = false;
    });

    if (result.isCriticalAlert || result.alertLevel == 'warning_pharmacist_review') {
      showDialog(
        context: context,
        builder: (_) => EmergencyDialog(safety: result),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(widget.state.language == 'ar' ? 'تم حفظ العرض بنجاح في سجلك' : 'Symptom saved successfully'),
          backgroundColor: SalusTheme.primaryTeal,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isAr = widget.state.language == 'ar';

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // 1. Patient Welcome Banner
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [SalusTheme.darkTeal, SalusTheme.primaryTeal],
                begin: Alignment.topRight,
                end: Alignment.bottomLeft,
              ),
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(color: SalusTheme.primaryTeal.withOpacity(0.2), blurRadius: 10, offset: const Offset(0, 4)),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(color: Colors.white.withOpacity(0.15), borderRadius: BorderRadius.circular(20)),
                      child: Text(
                        isAr ? 'لوحة المريض • سالوس' : 'Patient Portal • SALUS',
                        style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const Icon(Icons.shield_outlined, color: Colors.white70, size: 20),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  isAr ? 'أهلاً بك، أحمد حسن' : 'Welcome, Ahmed Hassan',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 20),
                ),
                const SizedBox(height: 4),
                Text(
                  isAr ? 'تابع أدويتك وسجّل أي عوارض تشعر بها لمراجعتها مع الصيدلي.' : 'Track your medicines and log symptoms for pharmacist review.',
                  style: const TextStyle(color: Colors.white70, fontSize: 12),
                ),
                const SizedBox(height: 16),

                // Fast Action Buttons: Voice Assistant & Camera Scanner
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: SalusTheme.darkTeal,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                        onPressed: () {
                          showModalBottomSheet(
                            context: context,
                            isScrollControlled: true,
                            backgroundColor: Colors.transparent,
                            builder: (_) => VoiceAssistantSheet(isAr: isAr),
                          );
                        },
                        icon: const Icon(Icons.mic, color: SalusTheme.primaryTeal, size: 20),
                        label: Text(
                          isAr ? 'المساعد الصوتي' : 'Voice Assistant',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white.withOpacity(0.15),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                        onPressed: () {
                          showModalBottomSheet(
                            context: context,
                            isScrollControlled: true,
                            backgroundColor: Colors.transparent,
                            builder: (_) => PackageScannerSheet(
                              isAr: isAr,
                              onConfirmed: (prod) {
                                widget.state.addPatientMed(prod);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text('تم تأكيد وإضافة ${prod.brandNameEn} إلى أدويتك'),
                                    backgroundColor: SalusTheme.primaryTeal,
                                  ),
                                );
                              },
                            ),
                          );
                        },
                        icon: const Icon(Icons.camera_alt_outlined, size: 20),
                        label: Text(
                          isAr ? 'مسح العبوة (OCR)' : 'Scan Box (OCR)',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Sub-Tab Switcher
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildTabChip('تسجيل عرض', 0, Icons.add_circle_outline),
                _buildTabChip('السجل الزمني (${widget.state.symptoms.length})', 1, Icons.history),
                _buildTabChip('أدويتي (${widget.state.patientMeds.length})', 2, Icons.medication_outlined),
                _buildTabChip('مشاركة الصيدلي', 3, Icons.share_outlined),
                _buildTabChip('التقرير الطبي', 4, Icons.description_outlined),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // TAB 0: SYMPTOM LOGGER
          if (_currentTab == 0) ...[
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          isAr ? 'تسجيل عرض جديد' : 'Log New Symptom',
                          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15, color: SalusTheme.darkTeal),
                        ),
                        InkWell(
                          onTap: () {
                            showModalBottomSheet(
                              context: context,
                              isScrollControlled: true,
                              backgroundColor: Colors.transparent,
                              builder: (_) => VoiceAssistantSheet(isAr: isAr),
                            );
                          },
                          child: const Row(
                            children: [
                              Icon(Icons.mic, size: 16, color: SalusTheme.primaryTeal),
                              SizedBox(width: 4),
                              Text('تسجيل بالصوت', style: TextStyle(color: SalusTheme.primaryTeal, fontSize: 11, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    TextField(
                      controller: _symptomNameController,
                      decoration: InputDecoration(
                        hintText: isAr ? 'اسم العرض (مثل: تورم بالقدمين، دوخة عند الوقوف...)' : 'Symptom name...',
                        hintStyle: const TextStyle(fontSize: 12),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Linked medication dropdown
                    DropdownButtonFormField<String>(
                      value: _selectedMedName,
                      decoration: const InputDecoration(labelText: 'مرتبط بأي دواء؟ (اختياري)'),
                      items: [
                        const DropdownMenuItem(value: null, child: Text('عرض عام / غير محدد')),
                        ...widget.state.patientMeds.map((m) {
                          return DropdownMenuItem(value: m.brandNameEn, child: Text('${m.brandNameEn} (${m.strength})'));
                        }),
                      ],
                      onChanged: (v) => setState(() => _selectedMedName = v),
                    ),
                    const SizedBox(height: 12),

                    // Severity Selector
                    Text(
                      isAr ? 'درجة الشدة:' : 'Severity:',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        _buildSeverityButton('خفيفة (Mild)', 'mild', const Color(0xFF10B981)),
                        const SizedBox(width: 6),
                        _buildSeverityButton('متوسطة (Moderate)', 'moderate', Colors.amber),
                        const SizedBox(width: 6),
                        _buildSeverityButton('شديدة (Severe)', 'severe', SalusTheme.criticalRed),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // Physiotherapy Impact Markers
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: SalusTheme.background,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.black12),
                      ),
                      child: Material(
                        color: Colors.transparent,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Row(
                              children: [
                                Icon(Icons.accessibility_new, size: 16, color: SalusTheme.primaryTeal),
                                SizedBox(width: 6),
                                Text(
                                  'تأثير العرض الحركي والوظيفي (العلاج الطبيعي):',
                                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11.5, color: SalusTheme.darkTeal),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            CheckboxListTile(
                              dense: true,
                              contentPadding: EdgeInsets.zero,
                              value: _impactBalance,
                              onChanged: (v) => setState(() => _impactBalance = v ?? false),
                              title: const Text('يؤثر على الاتزان والثبات أثناء الوقوف', style: TextStyle(fontSize: 11.5)),
                            ),
                            CheckboxListTile(
                              dense: true,
                              contentPadding: EdgeInsets.zero,
                              value: _impactWalking,
                              onChanged: (v) => setState(() => _impactWalking = v ?? false),
                              title: const Text('يؤثر على المشي أو يسبب صعوبة بالحركة', style: TextStyle(fontSize: 11.5)),
                            ),
                            CheckboxListTile(
                              dense: true,
                              contentPadding: EdgeInsets.zero,
                              value: _impactMobility,
                              onChanged: (v) => setState(() => _impactMobility = v ?? false),
                              title: const Text('يحد من حركة المفاصل أو الأطراف', style: TextStyle(fontSize: 11.5)),
                            ),
                            CheckboxListTile(
                              dense: true,
                              contentPadding: EdgeInsets.zero,
                              value: _fatigue,
                              onChanged: (v) => setState(() => _fatigue = v ?? false),
                              title: const Text('يسبب إرهاقاً سريعاً عند المجهود البدني', style: TextStyle(fontSize: 11.5)),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),

                    TextField(
                      controller: _notesController,
                      decoration: InputDecoration(
                        hintText: isAr ? 'ملاحظات إضافية لوصف ما تشعر به...' : 'Notes...',
                        hintStyle: const TextStyle(fontSize: 12),
                      ),
                    ),
                    const SizedBox(height: 14),

                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _submitSymptom,
                        child: Text(isAr ? 'حفظ وتدقيق الأمان السريري' : 'Save & Run Safety Check'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],

          // TAB 1: SYMPTOM TIMELINE
          if (_currentTab == 1) ...[
            ...widget.state.symptoms.map((s) {
              return Card(
                margin: const EdgeInsets.only(bottom: 10),
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              s.symptomName,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: SalusTheme.darkTeal),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.delete_outline, size: 18, color: Colors.grey),
                            onPressed: () => widget.state.deleteSymptom(s.id),
                          ),
                        ],
                      ),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: s.severity == 'severe'
                                  ? SalusTheme.criticalRed.withOpacity(0.1)
                                  : s.severity == 'moderate'
                                      ? Colors.amber.shade100
                                      : const Color(0xFFD1FAE5),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              s.severity.toUpperCase(),
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: s.severity == 'severe' ? SalusTheme.criticalRed : Colors.black87,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text('${s.startDate} • ${s.duration}', style: const TextStyle(fontSize: 11, color: SalusTheme.secondaryText)),
                        ],
                      ),
                      if (s.notes.isNotEmpty) ...[
                        const SizedBox(height: 6),
                        Text('"${s.notes}"', style: const TextStyle(fontSize: 11.5, fontStyle: FontStyle.italic, color: SalusTheme.mainText)),
                      ],
                      const SizedBox(height: 8),
                      // Mobility tags
                      Wrap(
                        spacing: 4,
                        children: [
                          if (s.impactBalance) _buildTag('تأثر الاتزان'),
                          if (s.impactWalking) _buildTag('تأثر المشي'),
                          if (s.impactMobility) _buildTag('حركة محدودة'),
                          if (s.fatigueDuringActivities) _buildTag('إرهاق بالمجهود'),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            }),
          ],

          // TAB 2: ACTIVE PRESCRIPTIONS
          if (_currentTab == 2) ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('أدويتي المسجلة للمتابعة', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: SalusTheme.darkTeal)),
                TextButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => MedicationSearchScreen(
                          state: widget.state,
                          onSelectForPrescription: (prod) => widget.state.addPatientMed(prod),
                        ),
                      ),
                    );
                  },
                  icon: const Icon(Icons.add, size: 16),
                  label: const Text('إضافة دواء'),
                ),
              ],
            ),
            const SizedBox(height: 8),
            ...widget.state.patientMeds.map((med) {
              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  leading: const Icon(Icons.medication, color: SalusTheme.primaryTeal),
                  title: Text(med.brandNameEn, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  subtitle: Text('${med.brandNameAr} • ${med.strength} • ${med.formulation}', style: const TextStyle(fontSize: 11)),
                  trailing: IconButton(
                    icon: const Icon(Icons.delete_outline, size: 18),
                    onPressed: () => widget.state.removePatientMed(med.id),
                  ),
                ),
              );
            }),
          ],

          // TAB 3: PHARMACIST CONSENT SHARING
          if (_currentTab == 3) ...[
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('إنشاء كود مشاركة للصيدلي', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: SalusTheme.darkTeal)),
                    const SizedBox(height: 6),
                    const Text(
                      'أنشئ كوداً مشفراً مؤقتاً وأعطه للصيدلي ليتمكن من مراجعة سجل أعراضك بأمان. يمكنك إلغاء الصلاحية فوراً في أي وقت.',
                      style: TextStyle(fontSize: 12, color: SalusTheme.secondaryText, height: 1.4),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          final code = widget.state.generateInviteCode();
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('تم إنشاء كود المشاركة: $code'), backgroundColor: SalusTheme.primaryTeal),
                          );
                        },
                        icon: const Icon(Icons.vpn_key_outlined, size: 18),
                        label: const Text('إنشاء كود مشاركة جديد'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            const Text('الأكواد والصلاحيات الحالية:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: SalusTheme.darkTeal)),
            const SizedBox(height: 6),
            ...widget.state.grants.map((g) {
              return Card(
                child: ListTile(
                  title: Text(g.invitationCode, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, fontFamily: 'monospace')),
                  subtitle: Text(g.pharmacistName ?? 'في انتظار ربط الصيدلي'),
                  trailing: g.isRevoked
                      ? const Text('ملغي', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 11))
                      : OutlinedButton(
                          style: OutlinedButton.styleFrom(foregroundColor: SalusTheme.criticalRed),
                          onPressed: () => widget.state.revokeGrant(g.id),
                          child: const Text('إلغاء الآن', style: TextStyle(fontSize: 11)),
                        ),
                ),
              );
            }),
          ],

          // TAB 4: MEDICAL REPORT PREVIEW
          if (_currentTab == 4) ...[
            Card(
              color: Colors.white,
              child: Padding(
                padding: const EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('SALUS | سالوس', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: SalusTheme.darkTeal)),
                        Text('تقرير طبي معتمد', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: SalusTheme.primaryTeal)),
                      ],
                    ),
                    const Divider(),
                    const Text('المريض: أحمد حسن | التاريخ: 2026-02-18', style: TextStyle(fontSize: 11, color: SalusTheme.secondaryText)),
                    const SizedBox(height: 12),
                    const Text('الأدوية الموصوفة:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: SalusTheme.darkTeal)),
                    ...widget.state.patientMeds.map((m) => Text('• ${m.brandNameEn} (${m.strength})', style: const TextStyle(fontSize: 11.5))),
                    const SizedBox(height: 12),
                    const Text('ملخص الأعراض المسجلة:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: SalusTheme.darkTeal)),
                    ...widget.state.symptoms.map((s) => Text('• ${s.symptomName} [${s.severity}]', style: const TextStyle(fontSize: 11.5))),
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(color: const Color(0xFFFFF1F2), borderRadius: BorderRadius.circular(10)),
                      child: const Text(
                        'إخلاء مسؤولية: هذا التقرير هو ملخص للمعلومات المسجلة ولا يمثل تشخيصاً طبياً. يحظر تعديل أو إيقاف الأدوية دون استشارة الطبيب.',
                        style: TextStyle(fontSize: 10, color: SalusTheme.criticalRed),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildTabChip(String label, int index, IconData icon) {
    final isSelected = _currentTab == index;
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: ChoiceChip(
        avatar: Icon(icon, size: 16, color: isSelected ? Colors.white : SalusTheme.primaryTeal),
        label: Text(label, style: TextStyle(fontSize: 11, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal, color: isSelected ? Colors.white : SalusTheme.darkTeal)),
        selected: isSelected,
        selectedColor: SalusTheme.primaryTeal,
        onSelected: (_) => setState(() => _currentTab = index),
      ),
    );
  }

  Widget _buildSeverityButton(String label, String value, Color color) {
    final isSelected = _selectedSeverity == value;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _selectedSeverity = value),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? color : SalusTheme.background,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: color.withOpacity(0.4)),
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isSelected ? Colors.white : Colors.black87),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTag(String title) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(6), border: Border.all(color: Colors.red.shade200)),
      child: Text(title, style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: Colors.red.shade900)),
    );
  }
}
