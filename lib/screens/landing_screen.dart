import 'package:flutter/material.dart';
import '../theme/salus_theme.dart';
import '../providers/app_state.dart';

class LandingScreen extends StatelessWidget {
  final AppState state;
  final VoidCallback onGetStarted;
  final VoidCallback onPharmacistPortal;
  final VoidCallback onSearchMeds;

  const LandingScreen({
    super.key,
    required this.state,
    required this.onGetStarted,
    required this.onPharmacistPortal,
    required this.onSearchMeds,
  });

  @override
  Widget build(BuildContext context) {
    final isAr = state.language == 'ar';

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // 1. HERO SECTION
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 36),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFFEAF7F1), Color(0xFFF7FAF8)],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
            child: Column(
              children: [
                // SALUS Brand Logo
                Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(22),
                    boxShadow: [
                      BoxShadow(
                        color: SalusTheme.primaryTeal.withOpacity(0.2),
                        blurRadius: 16,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(22),
                    child: Image.asset(
                      'assets/images/salus_logo.png',
                      width: 84,
                      height: 84,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => const SizedBox.shrink(),
                    ),
                  ),
                ),

                // Trust pill
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(30),
                    border: Border.all(color: SalusTheme.primaryTeal.withOpacity(0.3)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.verified_user_rounded, color: SalusTheme.primaryTeal, size: 16),
                      const SizedBox(width: 6),
                      Text(
                        isAr
                            ? 'أمان دوائي مبني على الأدلة السريرية • مصر'
                            : 'Evidence-Backed Medication Safety • Egypt',
                        style: const TextStyle(
                          color: SalusTheme.darkTeal,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Hero Headline
                Text(
                  isAr
                      ? 'افهم دواءك. سجّل أعراضك. وخليك على تواصل مع الصيدلي.'
                      : 'Understand Your Medicine. Track Your Symptoms. Stay Connected.',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.w900,
                    color: SalusTheme.darkTeal,
                    height: 1.3,
                  ),
                ),
                const SizedBox(height: 14),

                // Subtitle
                Text(
                  isAr
                      ? 'منصة ذكية موثوقة لمساعدة المرضى في فهم أدويتهم ورصد الآثار الجانبية ومشاركة سجلاتهم الصحية مع الصيدلي بطريقة آمنة ومشروطة بالموافقة.'
                      : 'An evidence-backed healthcare platform helping patients understand medication risks, track adverse symptoms, and securely consult licensed pharmacists.',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 14,
                    color: SalusTheme.secondaryText,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 24),

                // CTA Buttons
                Wrap(
                  spacing: 12,
                  runSpacing: 12,
                  alignment: WrapAlignment.center,
                  children: [
                    ElevatedButton.icon(
                      onPressed: onGetStarted,
                      icon: const Icon(Icons.arrow_forward_rounded, size: 18),
                      label: Text(isAr ? 'ابدأ الآن (حساب مريض)' : 'Get Started (Patient)'),
                    ),
                    OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: SalusTheme.darkTeal,
                        side: const BorderSide(color: SalusTheme.primaryTeal, width: 1.5),
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      onPressed: onPharmacistPortal,
                      icon: const Icon(Icons.medical_services_outlined, size: 18),
                      label: Text(
                        isAr ? 'أنا صيدلي' : "I'm a Pharmacist",
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Privacy guarantee micro-note
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.lock_outline, size: 14, color: SalusTheme.primaryTeal),
                    const SizedBox(width: 4),
                    Flexible(
                      child: Text(
                        isAr ? 'بياناتك ملكك بالكامل. مشاركة مشروطة بإذنك مع إمكانية الإلغاء الفوري.' : 'Patient-owned records. Explicit consent with instant revocation.',
                        style: const TextStyle(fontSize: 11, color: SalusTheme.secondaryText),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // 2. HOW SALUS WORKS (3 Steps)
          Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isAr ? 'كيف يعمل سالوس لحمايتك؟' : 'How SALUS Works for You',
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: SalusTheme.darkTeal),
                ),
                const SizedBox(height: 16),
                _buildStepCard(
                  step: '1',
                  title: isAr ? 'ابحث أو امسح علبة الدواء' : 'Search or Scan Package',
                  desc: isAr
                      ? 'استخدم الصوت، الكتابة، أو الكاميرا لمسح العبوة وتأكيد الدواء والتركيز.'
                      : 'Use Egyptian voice, text search, or camera OCR with patient confirmation.',
                  icon: Icons.search_rounded,
                  color: SalusTheme.primaryTeal,
                ),
                const SizedBox(height: 12),
                _buildStepCard(
                  step: '2',
                  title: isAr ? 'افهم الأعراض وسجّل أثرها الحركي' : 'Understand & Track Symptoms',
                  desc: isAr
                      ? 'تعرف على نسب الآثار الجانبية الحقيقية وسجل أثرها على اتزانك وقدرتك على المشي.'
                      : 'View real clinical trial rates and record impact on balance, walking, and fatigue.',
                  icon: Icons.directions_walk_rounded,
                  color: const Color(0xFF10B981),
                ),
                const SizedBox(height: 12),
                _buildStepCard(
                  step: '3',
                  title: isAr ? 'شارك سجلك مع الصيدلي بكود آمن' : 'Connect with Pharmacist',
                  desc: isAr
                      ? 'أنشئ كود مشاركة سري مؤقت ليقوم الصيدلي المرخص بمراجعة حالتك وكتابة توجيهاته.'
                      : 'Generate a short-lived token for your pharmacist to review authorized records.',
                  icon: Icons.verified_rounded,
                  color: SalusTheme.darkTeal,
                ),
              ],
            ),
          ),

          // 3. INITIAL MEDICATION SCOPE (3 Categories, 9 Ingredients)
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 20),
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: SalusTheme.primaryTeal.withOpacity(0.2)),
              boxShadow: [
                BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 4)),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      isAr ? 'النطاق الدوائي الأولي (9 مواد فعالة)' : 'Initial 9 Active Ingredients',
                      style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: SalusTheme.darkTeal),
                    ),
                    TextButton(
                      onPressed: onSearchMeds,
                      child: Text(isAr ? 'عرض الكل' : 'View All'),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                _buildScopeGroup(
                  title: isAr ? 'أدوية ضغط الدم (Hypertension)' : 'Hypertension',
                  drugs: ['Amlodipine (نورفاسك)', 'Losartan (كوزار)', 'Bisoprolol (كونكور)'],
                  color: Colors.red.shade700,
                ),
                const SizedBox(height: 10),
                _buildScopeGroup(
                  title: isAr ? 'أدوية السكري (Diabetes)' : 'Diabetes',
                  drugs: ['Metformin (جلوكوفاج)', 'Gliclazide (دياميكرون)', 'Empagliflozin (جارديانس)'],
                  color: Colors.blue.shade700,
                ),
                const SizedBox(height: 10),
                _buildScopeGroup(
                  title: isAr ? 'مسكنات الألم ومضادات الالتهاب' : 'Pain Relief & NSAIDs',
                  drugs: ['Paracetamol (بنادول - Non-NSAID)', 'Ibuprofen (بروفين - NSAID)', 'Diclofenac (فولتارين - NSAID)'],
                  color: Colors.amber.shade800,
                ),
              ],
            ),
          ),

          // 4. PHYSIOTHERAPY & BIOTECHNOLOGY SECTION
          Padding(
            padding: const EdgeInsets.all(24),
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFFEAF7F1),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: SalusTheme.primaryTeal.withOpacity(0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.accessibility_new_rounded, color: SalusTheme.primaryTeal),
                      const SizedBox(width: 8),
                      Text(
                        isAr ? 'تكامل العلاج الطبيعي والحركي' : 'Physiotherapy & Mobility Tracking',
                        style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: SalusTheme.darkTeal),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    isAr
                        ? 'العديد من الأدوية تؤثر مباشرة على الاتزان والمشي (مثل أدوية الضغط وحاصرات بيتا). يتيح سالوس للمريض رصد مدى تأثير العرض على اتزانه وقدرته على المشي لتوفير صورة سريرية شاملة للفريق الطبي دون إدعاء تشخيص طبي.'
                        : 'Medications often impact balance and gait (e.g. CCBs, beta-blockers). SALUS lets patients monitor functional mobility impact to assist clinical reviews.',
                    style: const TextStyle(fontSize: 12.5, color: SalusTheme.mainText, height: 1.5),
                  ),
                ],
              ),
            ),
          ),

          // 5. SDGs SECTION
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isAr ? 'التوافق مع أهداف التنمية المستدامة (SDGs)' : 'SDG Alignment',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: SalusTheme.darkTeal),
                ),
                const SizedBox(height: 8),
                Text(
                  isAr
                      ? '• SDG 3: الصحة الجيدة والرفاه والحد من سمية ومضاعفات الأدوية.\n• SDG 9: الصناعة والابتكار وبنية التكنولوجيا الصحية الرقمية بمصر.\n• SDG 10: الحد من أوجه عدم المساواة عبر التمكين الصوتي لكبار السن.'
                      : '• SDG 3: Good Health & Well-being (Adverse drug event mitigation)\n• SDG 9: Industry & Innovation (Digital health tech)\n• SDG 10: Reduced Inequalities (Voice accessibility for seniors)',
                  style: const TextStyle(fontSize: 12, color: SalusTheme.secondaryText, height: 1.6),
                ),
              ],
            ),
          ),

          // 6. MEDICAL DISCLAIMER & EMERGENCY NUMBERS
          Container(
            margin: const EdgeInsets.all(24),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.black12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.info_outline, color: SalusTheme.criticalRed, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      isAr ? 'إخلاء مسؤولية طبي وطوارئ مصر' : 'Medical Disclaimer & Emergency 123',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: SalusTheme.criticalRed),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  isAr
                      ? 'سالوس منصة توجيهية ومعلوماتية ولا تقدم تشخيصاً طبياً ولا تعتبر بديلاً عن الطبيب أو الصيدلي. لا توقف أو تعدل جرعة دوائك بنفسك أبداً. في حالات الطوارئ اتصل بالإسعاف (123) فوراً.'
                      : 'SALUS is an information platform and does not provide clinical diagnoses. Never alter prescription doses independently. In medical emergencies, call 123 immediately.',
                  style: const TextStyle(fontSize: 11.5, color: SalusTheme.secondaryText, height: 1.4),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildStepCard({required String step, required String title, required String desc, required IconData icon, required Color color}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.black.withOpacity(0.06)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(color: color.withOpacity(0.12), borderRadius: BorderRadius.circular(12)),
            child: Center(
              child: Text(step, style: TextStyle(fontWeight: FontWeight.w900, color: color, fontSize: 16)),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: SalusTheme.darkTeal)),
                const SizedBox(height: 4),
                Text(desc, style: const TextStyle(fontSize: 12, color: SalusTheme.secondaryText, height: 1.4)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildScopeGroup({required String title, required List<String> drugs, required Color color}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
            const SizedBox(width: 8),
            Text(title, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12.5, color: color)),
          ],
        ),
        const SizedBox(height: 6),
        Wrap(
          spacing: 6,
          runSpacing: 6,
          children: drugs.map((d) {
            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(color: SalusTheme.background, borderRadius: BorderRadius.circular(8)),
              child: Text(d, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: SalusTheme.mainText)),
            );
          }).toList(),
        ),
      ],
    );
  }
}

class BoxStyle {
  final Color color;
  final double blurRadius;
  final Offset offset;
  BoxStyle({required this.color, required this.blurRadius, required this.offset});
}
