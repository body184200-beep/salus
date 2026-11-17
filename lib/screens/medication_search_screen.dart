import 'package:flutter/material.dart';
import '../data/salus_data.dart';
import '../models/models.dart';
import '../theme/salus_theme.dart';
import '../providers/app_state.dart';

class MedicationSearchScreen extends StatefulWidget {
  final AppState state;
  final Function(MedicationProduct)? onSelectForPrescription;

  const MedicationSearchScreen({super.key, required this.state, this.onSelectForPrescription});

  @override
  State<MedicationSearchScreen> createState() => _MedicationSearchScreenState();
}

class _MedicationSearchScreenState extends State<MedicationSearchScreen> {
  String _searchQuery = '';
  String _selectedCategoryId = '';

  @override
  Widget build(BuildContext context) {
    final isAr = widget.state.language == 'ar';

    final filteredIngredients = SalusData.ingredients.where((ing) {
      if (_selectedCategoryId.isNotEmpty && ing.categoryId != _selectedCategoryId) {
        return false;
      }
      if (_searchQuery.isEmpty) return true;

      final q = _searchQuery.toLowerCase();
      final inGeneric = ing.nameEn.toLowerCase().contains(q) || ing.nameAr.contains(q);
      final inClass = ing.drugClassEn.toLowerCase().contains(q) || ing.drugClassAr.contains(q);
      final inBrands = SalusData.products.any(
        (p) => p.activeIngredientId == ing.id &&
            (p.brandNameEn.toLowerCase().contains(q) || p.brandNameAr.contains(q)),
      );

      return inGeneric || inClass || inBrands;
    }).toList();

    return Scaffold(
      backgroundColor: SalusTheme.background,
      appBar: AppBar(
        title: Text(
          isAr ? 'دليل الأدوية والآثار الجانبية الموثقة' : 'Verified Medication Guide',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 17),
        ),
      ),
      body: Column(
        children: [
          // Search & Filter Box
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.white,
            child: Column(
              children: [
                TextField(
                  onChanged: (val) => setState(() => _searchQuery = val),
                  decoration: InputDecoration(
                    hintText: isAr
                        ? 'ابحث بالاسم العلمي، العربي، أو التجاري (نورفاسك، كونكور...)'
                        : 'Search generic, Arabic, or brand (Norvasc, Concor...)',
                    hintStyle: const TextStyle(fontSize: 12),
                    prefixIcon: const Icon(Icons.search, color: SalusTheme.primaryTeal),
                    suffixIcon: _searchQuery.isNotEmpty
                        ? IconButton(icon: const Icon(Icons.clear), onPressed: () => setState(() => _searchQuery = ''))
                        : null,
                  ),
                ),
                const SizedBox(height: 10),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildFilterChip('الكل / All', '', _selectedCategoryId.isEmpty),
                      ...SalusData.categories.map((c) {
                        return _buildFilterChip(
                          isAr ? c.nameAr : c.nameEn,
                          c.id,
                          _selectedCategoryId == c.id,
                        );
                      }),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // List of matching active ingredients
          Expanded(
            child: filteredIngredients.isEmpty
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.info_outline, size: 40, color: SalusTheme.secondaryText),
                          const SizedBox(height: 12),
                          Text(
                            isAr ? 'المعلومة دي مش متوفرة بشكل موثوق حاليًا.' : 'Reliable information is not currently available.',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: SalusTheme.darkTeal),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 6),
                          Text(
                            isAr
                                ? 'يغطي سالوس حالياً 9 مواد فعالة موثقة للضغط والسكري ومسكنات الألم.'
                                : 'SALUS currently covers 9 initial verified ingredients.',
                            style: const TextStyle(fontSize: 12, color: SalusTheme.secondaryText),
                          ),
                        ],
                      ),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: filteredIngredients.length,
                    itemBuilder: (context, idx) {
                      final ing = filteredIngredients[idx];
                      final brands = SalusData.products.where((p) => p.activeIngredientId == ing.id).toList();

                      return Card(
                        margin: const EdgeInsets.only(bottom: 14),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      isAr ? '${ing.nameAr} (${ing.nameEn})' : '${ing.nameEn} (${ing.nameAr})',
                                      style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: SalusTheme.darkTeal),
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: ing.id == 'ing-paracetamol'
                                          ? const Color(0xFFECFDF5)
                                          : ing.isNsaid
                                              ? Colors.amber.shade50
                                              : SalusTheme.lightMint,
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(
                                        color: ing.id == 'ing-paracetamol'
                                            ? const Color(0xFF6EE7B7)
                                            : ing.isNsaid
                                                ? Colors.amber.shade400
                                                : SalusTheme.primaryTeal.withOpacity(0.3),
                                      ),
                                    ),
                                    child: Text(
                                      ing.id == 'ing-paracetamol'
                                          ? 'Non-NSAID'
                                          : ing.isNsaid
                                              ? 'NSAID'
                                              : 'Active',
                                      style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                        color: ing.id == 'ing-paracetamol'
                                            ? const Color(0xFF065F46)
                                            : ing.isNsaid
                                                ? Colors.amber.shade900
                                                : SalusTheme.darkTeal,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                isAr ? ing.drugClassAr : ing.drugClassEn,
                                style: const TextStyle(fontSize: 12, color: SalusTheme.secondaryText, fontWeight: FontWeight.w600),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                isAr ? ing.generalPurposeAr : ing.generalPurposeEn,
                                style: const TextStyle(fontSize: 12.5, color: SalusTheme.mainText, height: 1.4),
                              ),
                              const SizedBox(height: 10),

                              // Egyptian Brands Chips
                              Wrap(
                                spacing: 6,
                                runSpacing: 4,
                                children: brands.map((b) {
                                  return InkWell(
                                    onTap: () {
                                      if (widget.onSelectForPrescription != null) {
                                        widget.onSelectForPrescription!(b);
                                        Navigator.pop(context);
                                      }
                                    },
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: SalusTheme.background,
                                        borderRadius: BorderRadius.circular(6),
                                        border: Border.all(color: Colors.black12),
                                      ),
                                      child: Text(
                                        '${b.brandNameEn} (${b.strength})',
                                        style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: SalusTheme.darkTeal),
                                      ),
                                    ),
                                  );
                                }).toList(),
                              ),
                              const SizedBox(height: 12),

                              // Monograph button
                              SizedBox(
                                width: double.infinity,
                                child: OutlinedButton.icon(
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: SalusTheme.primaryTeal,
                                    side: const BorderSide(color: SalusTheme.primaryTeal),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  ),
                                  onPressed: () => _showMonographDialog(context, ing, brands, isAr),
                                  icon: const Icon(Icons.analytics_outlined, size: 16),
                                  label: Text(
                                    isAr ? 'عرض نسب الآثار الجانبية والأدلة' : 'Clinical Evidence & Side Effects',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String id, bool isSelected) {
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: ChoiceChip(
        label: Text(label, style: TextStyle(fontSize: 11, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
        selected: isSelected,
        selectedColor: SalusTheme.lightMint,
        onSelected: (_) => setState(() => _selectedCategoryId = id),
      ),
    );
  }

  void _showMonographDialog(BuildContext context, ActiveIngredient ing, List<MedicationProduct> brands, bool isAr) {
    final adverse = SalusData.adverseEffects.where((a) => a.activeIngredientId == ing.id).toList();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          height: MediaQuery.of(context).size.height * 0.85,
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      isAr ? '${ing.nameAr} (${ing.nameEn})' : '${ing.nameEn} (${ing.nameAr})',
                      style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: SalusTheme.darkTeal),
                    ),
                  ),
                  IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
                ],
              ),
              const Divider(),
              Expanded(
                child: ListView(
                  children: [
                    // Purpose
                    Text(
                      isAr ? 'الاستخدام العلاجي المعتمد:' : 'Clinical Indication:',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: SalusTheme.secondaryText),
                    ),
                    Text(isAr ? ing.generalPurposeAr : ing.generalPurposeEn, style: const TextStyle(fontSize: 13, height: 1.4)),
                    const SizedBox(height: 12),

                    // Boxed Warnings
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: const Color(0xFFFFF1F2), borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.red.shade200)),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Row(
                            children: [
                              Icon(Icons.warning, color: SalusTheme.criticalRed, size: 16),
                              SizedBox(width: 6),
                              Text('تحذيرات هامة وموانع استخدام:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: SalusTheme.criticalRed)),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(isAr ? ing.warningsAr : ing.warningsEn, style: const TextStyle(fontSize: 11.5, color: SalusTheme.criticalRed, height: 1.4)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Adverse effects from trials
                    Text(
                      isAr ? 'الآثار الجانبية ونسبها الحقيقية من التجارب السريرية:' : 'Documented Adverse Events (True Clinical Trial Rates):',
                      style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: SalusTheme.darkTeal),
                    ),
                    const SizedBox(height: 8),

                    if (adverse.isEmpty)
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(color: SalusTheme.background, borderRadius: BorderRadius.circular(12)),
                        child: Text(
                          isAr ? 'المعلومة دي مش متوفرة بشكل موثوق حاليًا.' : 'Reliable information is not currently available.',
                          style: const TextStyle(fontSize: 12, fontStyle: FontStyle.italic),
                        ),
                      )
                    else
                      ...adverse.map((ae) {
                        return Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: SalusTheme.background,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: Colors.black12),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(isAr ? ae.nameAr : ae.nameEn, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: SalusTheme.darkTeal)),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                    decoration: BoxDecoration(color: SalusTheme.lightMint, borderRadius: BorderRadius.circular(6)),
                                    child: Text(isAr ? ae.frequencyDisplayAr : ae.frequencyDisplayEn, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 11, color: SalusTheme.primaryTeal)),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(isAr ? ae.descriptionAr : ae.descriptionEn, style: const TextStyle(fontSize: 11.5, color: SalusTheme.mainText)),
                              const SizedBox(height: 6),
                              Text('المصدر والدراسة: ${ae.sourceStudy} (${ae.sampleSize})', style: const TextStyle(fontSize: 10, color: SalusTheme.secondaryText)),
                              Text('وقت البدء: ${isAr ? ae.timeToOnsetAr : ae.timeToOnsetEn}', style: const TextStyle(fontSize: 10, color: SalusTheme.secondaryText)),
                            ],
                          ),
                        );
                      }),
                    const SizedBox(height: 10),

                    // Interactions
                    Text(
                      isAr ? 'التداخلات الدوائية المهمة:' : 'Drug Interactions:',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: SalusTheme.secondaryText),
                    ),
                    Text(isAr ? ing.interactionsAr : ing.interactionsEn, style: const TextStyle(fontSize: 12, height: 1.4)),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
