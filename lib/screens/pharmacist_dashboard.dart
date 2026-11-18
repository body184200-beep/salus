import 'package:flutter/material.dart';
import '../providers/app_state.dart';
import '../theme/salus_theme.dart';
import '../models/models.dart';

class PharmacistDashboard extends StatefulWidget {
  final AppState state;

  const PharmacistDashboard({super.key, required this.state});

  @override
  State<PharmacistDashboard> createState() => _PharmacistDashboardState();
}

class _PharmacistDashboardState extends State<PharmacistDashboard> {
  final _codeController = TextEditingController();
  final _clinicalNoteController = TextEditingController();
  FollowUpCase? _selectedCase;

  void _claimCode() {
    if (_codeController.text.trim().isEmpty) return;

    final success = widget.state.connectPatientCode(_codeController.text.trim());
    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تم ربط ملف المريض بنجاح بموجب الموافقة المعتمدة'), backgroundColor: SalusTheme.primaryTeal),
      );
      _codeController.clear();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('كود المشاركة غير صحيح أو منتهي الصلاحية'), backgroundColor: SalusTheme.criticalRed),
      );
    }
  }

  void _saveNote() {
    if (_selectedCase == null || _clinicalNoteController.text.trim().isEmpty) return;

    widget.state.savePharmacistNote(_selectedCase!.id, _clinicalNoteController.text.trim());
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('تم حفظ الملاحظة الإكلينيكية وإتمام المتابعة'), backgroundColor: SalusTheme.primaryTeal),
    );
    setState(() => _selectedCase = null);
  }

  @override
  Widget build(BuildContext context) {
    final user = widget.state.currentUser;
    final isVerified = user?.pharmacistVerificationStatus == 'verified';
    final isAr = widget.state.language == 'ar';

    // PENDING PHARMACIST SCREEN
    if (!isVerified) {
      return SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: const Color(0xFFFFFBEB),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: Colors.amber.shade300),
          ),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: Colors.amber.shade600, shape: BoxShape.circle),
                child: const Icon(Icons.lock_clock, color: Colors.white, size: 36),
              ),
              const SizedBox(height: 16),
              Text(
                isAr ? 'حساب الصيدلي قيد المراجعة والتحقق النقابي' : 'Pharmacist Verification Pending',
                style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: Colors.amber.shade900),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                isAr
                    ? 'وفقاً لبروتوكول الأمان الدوائي في سالوس، لا تُمنح الصلاحيات السريرية والاطلاع على بيانات المرضى إلا بعد التحقق من ترخيص مزاولة المهنة المعتمد من نقابة الصيادلة المصرية.'
                    : 'Clinical access and patient data review are locked until syndicate registration is verified.',
                style: TextStyle(fontSize: 12.5, color: Colors.amber.shade900, height: 1.5),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(10)),
                child: const Text('الحالة: قيد المراجعة (Pending Review)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.amber)),
              ),
            ],
          ),
        ),
      );
    }

    // VERIFIED PHARMACIST SCREEN
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Pharmacist Badge Banner
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF174D49), Color(0xFF0F766E)],
                begin: Alignment.topRight,
                end: Alignment.bottomLeft,
              ),
              borderRadius: BorderRadius.circular(24),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: user?.isDoctor == true ? const Color(0xFF60A5FA) : const Color(0xFF34D399),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.verified, size: 14, color: SalusTheme.darkTeal),
                      const SizedBox(width: 4),
                      Text(
                        user?.isDoctor == true
                            ? 'طبيب بشري معتمد • نقابة أطباء مصر'
                            : user?.isNurse == true
                                ? 'هيئة التمريض المعتمدة • رعاية إكلينيكية'
                                : 'صيدلي معتمد نقابياً • نقابة صيادلة مصر',
                        style: const TextStyle(color: SalusTheme.darkTeal, fontWeight: FontWeight.bold, fontSize: 10.5),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  user?.displayName ?? 'د. مريم فاروق',
                  style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 20, color: Colors.white),
                ),
                const SizedBox(height: 4),
                Text(
                  user?.isDoctor == true
                      ? 'بوابة متابعة المرضى والتقارير الطبية والأمان الدوائي'
                      : user?.isNurse == true
                          ? 'مستشفى السلام الدولي • الممرضة المشرفة على رعاية ومتابعة الحالات'
                          : 'صيدلية النيل الحديثة - المعادي • رخصة مزاولة المهنة: EGY-PH-84920',
                  style: const TextStyle(fontSize: 11.5, color: Colors.white70),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Connect by Code Form
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('ربط ملف مريض جديد برمز المشاركة', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: SalusTheme.darkTeal)),
                  const SizedBox(height: 4),
                  const Text('أدخل الكود السري الذي زوّدك به المريض للاطلاع على سجل الأعراض المأذون به فقط.', style: TextStyle(fontSize: 11.5, color: SalusTheme.secondaryText)),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _codeController,
                          decoration: const InputDecoration(
                            hintText: 'SALUS-XXXX-XXXX',
                            hintStyle: TextStyle(fontSize: 12),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton(
                        onPressed: _claimCode,
                        child: const Text('ربط الملف'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Case Review Dialog / View
          if (_selectedCase != null) ...[
            Card(
              color: Colors.white,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('مراجعة حالة: ${_selectedCase!.patientName}', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15, color: SalusTheme.darkTeal)),
                        IconButton(icon: const Icon(Icons.close), onPressed: () => setState(() => _selectedCase = null)),
                      ],
                    ),
                    const Divider(),
                    if (_selectedCase!.patientNotes != null) ...[
                      Text('طلب واستفسار المريض: "${_selectedCase!.patientNotes}"', style: const TextStyle(fontSize: 12, fontStyle: FontStyle.italic, color: SalusTheme.mainText)),
                      const SizedBox(height: 10),
                    ],
                    const Text('الأدوية الموصوفة للمريض:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: SalusTheme.darkTeal)),
                    ...widget.state.patientMeds.map((m) => Text('• ${m.brandNameEn} (${m.strength})', style: const TextStyle(fontSize: 11.5))),
                    const SizedBox(height: 10),
                    const Text('الأعراض المسجلة مع علامات الحركة:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: SalusTheme.darkTeal)),
                    ...widget.state.symptoms.map((s) => Text('• ${s.symptomName} [${s.severity}] ${s.impactWalking ? '- يؤثر على المشي' : ''}', style: const TextStyle(fontSize: 11.5))),
                    const SizedBox(height: 14),

                    // Pharmacist Clinical Note Form
                    const Text('تسجيل التوصية والملاحظة الإكلينيكية:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: SalusTheme.darkTeal)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _clinicalNoteController,
                      maxLines: 4,
                      decoration: const InputDecoration(
                        hintText: 'اكتب توجيهات الجرعة أو نصيحة مراجعة الطبيب لتعديل الدواء...',
                        hintStyle: TextStyle(fontSize: 12),
                      ),
                    ),
                    const SizedBox(height: 10),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _saveNote,
                        child: const Text('اعتماد التوصية وإتمام المتابعة'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
          ],

          // Active Cases List
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('حالات المتابعة السريرية النشطة', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: SalusTheme.darkTeal)),
              Text('${widget.state.cases.length} حالات', style: const TextStyle(fontSize: 11, color: SalusTheme.secondaryText)),
            ],
          ),
          const SizedBox(height: 8),

          ...widget.state.cases.map((c) {
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
                        Text(c.patientName, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14, color: SalusTheme.darkTeal)),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: c.status == 'completed' ? const Color(0xFFECFDF5) : Colors.amber.shade50,
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: c.status == 'completed' ? const Color(0xFF6EE7B7) : Colors.amber.shade300),
                          ),
                          child: Text(
                            c.status == 'completed' ? 'تمت المتابعة' : 'قيد المراجعة',
                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: c.status == 'completed' ? const Color(0xFF065F46) : Colors.amber.shade900),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text('كود المشاركة: ${c.invitationCode}', style: const TextStyle(fontSize: 11, color: SalusTheme.secondaryText, fontFamily: 'monospace')),
                    if (c.patientNotes != null) ...[
                      const SizedBox(height: 6),
                      Text('"${c.patientNotes}"', style: const TextStyle(fontSize: 11.5, color: SalusTheme.mainText)),
                    ],
                    if (c.pharmacistNotes != null) ...[
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(color: SalusTheme.lightMint, borderRadius: BorderRadius.circular(8)),
                        child: Text('توصية الصيدلي: ${c.pharmacistNotes}', style: const TextStyle(fontSize: 11, color: SalusTheme.darkTeal, fontWeight: FontWeight.bold)),
                      ),
                    ],
                    const SizedBox(height: 10),
                    Align(
                      alignment: Alignment.centerLeft,
                      child: TextButton.icon(
                        onPressed: () {
                          setState(() {
                            _selectedCase = c;
                            _clinicalNoteController.text = c.pharmacistNotes ?? '';
                          });
                        },
                        icon: const Icon(Icons.remove_red_eye_outlined, size: 16),
                        label: const Text('مراجعة السجل وكتابة توصية'),
                      ),
                    ),
                  ],
                ),
              ),
            );
          }),
        ],
      ),
    );
  }
}
