import 'package:flutter/material.dart';
import '../services/ocr_service.dart';
import '../theme/salus_theme.dart';
import '../models/models.dart';

class PackageScannerSheet extends StatefulWidget {
  final bool isAr;
  final Function(MedicationProduct) onConfirmed;

  const PackageScannerSheet({super.key, required this.isAr, required this.onConfirmed});

  @override
  State<PackageScannerSheet> createState() => _PackageScannerSheetState();
}

class _PackageScannerSheetState extends State<PackageScannerSheet> {
  String _extractedText = '';
  List<OcrMatchCandidate> _candidates = [];
  OcrMatchCandidate? _selectedCandidate;
  bool _confirmed = false;

  void _scanPreset(String text) {
    setState(() {
      _extractedText = text;
      _candidates = OcrService.scanText(text);
      _selectedCandidate = _candidates.isNotEmpty ? _candidates.first : null;
      _confirmed = false;
    });
  }

  @override
  Widget build(BuildContext context) {
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
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(color: SalusTheme.lightMint, borderRadius: BorderRadius.circular(12)),
                    child: const Icon(Icons.camera_alt, color: SalusTheme.primaryTeal),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    widget.isAr ? 'مسح علبة الدواء بالكاميرا (OCR)' : 'Package Scanner (OCR)',
                    style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: SalusTheme.darkTeal),
                  ),
                ],
              ),
              IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
            ],
          ),
          const Divider(),

          // Camera viewfinder simulation & sample chips
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: SalusTheme.background,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.black12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.document_scanner, color: SalusTheme.primaryTeal, size: 20),
                    const SizedBox(width: 6),
                    Text(
                      widget.isAr ? 'نماذج سريعة لمسح العبوات:' : 'Quick Packaging Samples:',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: [
                    ActionChip(
                      label: const Text('Norvasc 5mg', style: TextStyle(fontSize: 11)),
                      onPressed: () => _scanPreset('NORVASC 5mg Pfizer Amlodipine besylate 30 tabs'),
                    ),
                    ActionChip(
                      label: const Text('Glucophage 1000mg', style: TextStyle(fontSize: 11)),
                      onPressed: () => _scanPreset('GLUCOPHAGE 1000mg Metformin HCl Merck 30 tablets'),
                    ),
                    ActionChip(
                      label: const Text('Panadol Advance 500mg', style: TextStyle(fontSize: 11)),
                      onPressed: () => _scanPreset('PANADOL Advance Paracetamol 500mg Haleon'),
                    ),
                    ActionChip(
                      label: const Text('Brufen 400mg', style: TextStyle(fontSize: 11)),
                      onPressed: () => _scanPreset('BRUFEN 400mg Ibuprofen Abbott Kahira'),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Mandatory uncertainty check
          if (_extractedText.isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: SalusTheme.warningAmber,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.amber.shade300),
              ),
              child: Row(
                children: [
                  Icon(Icons.warning_amber_rounded, color: Colors.amber.shade900, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      widget.isAr
                          ? 'تنبيه أمان: قراءة الكاميرا قد تحتوي على أخطاء. يجب تأكيد مطابقة الدواء بيدك قبل الاعتماد.'
                          : 'Safety check: OCR text recognition may contain errors. Manual patient confirmation is mandatory.',
                      style: TextStyle(fontSize: 11, color: Colors.amber.shade900, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),
          ],

          // Candidates list
          Expanded(
            child: _candidates.isEmpty
                ? Center(
                    child: Text(
                      widget.isAr ? 'اختر أحد النماذج أعلاه لتجربة المسح الفوري' : 'Choose a sample above to scan',
                      style: const TextStyle(color: SalusTheme.secondaryText, fontSize: 13),
                    ),
                  )
                : ListView.builder(
                    itemCount: _candidates.length,
                    itemBuilder: (ctx, idx) {
                      final cand = _candidates[idx];
                      final isSelected = _selectedCandidate?.product.id == cand.product.id;

                      return InkWell(
                        onTap: () => setState(() => _selectedCandidate = cand),
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: isSelected ? SalusTheme.lightMint : Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isSelected ? SalusTheme.primaryTeal : Colors.black12,
                              width: isSelected ? 2 : 1,
                            ),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                isSelected ? Icons.check_circle : Icons.radio_button_unchecked,
                                color: isSelected ? SalusTheme.primaryTeal : Colors.grey,
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      '${cand.product.brandNameEn} (${cand.product.brandNameAr}) - ${cand.product.strength}',
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                    ),
                                    Text(
                                      '${cand.ingredient.nameEn} • ${cand.matchReason}',
                                      style: const TextStyle(fontSize: 11, color: SalusTheme.secondaryText),
                                    ),
                                  ],
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8)),
                                child: Text(
                                  '${cand.confidenceScore}% تطابق',
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: SalusTheme.primaryTeal),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),

          // Mandatory Confirmation Checkbox
          if (_selectedCandidate != null) ...[
            CheckboxListTile(
              value: _confirmed,
              onChanged: (v) => setState(() => _confirmed = v ?? false),
              title: Text(
                widget.isAr
                    ? 'أؤكد أنني راجعت العبوة بيدي وأن الدواء هو "${_selectedCandidate!.product.brandNameEn}" (${_selectedCandidate!.product.strength}).'
                    : 'I confirm that this matches my physical medicine box (${_selectedCandidate!.product.brandNameEn}).',
                style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold),
              ),
              controlAffinity: ListTileControlAffinity.leading,
              contentPadding: EdgeInsets.zero,
            ),
            const SizedBox(height: 6),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _confirmed
                    ? () {
                        widget.onConfirmed(_selectedCandidate!.product);
                        Navigator.pop(context);
                      }
                    : null,
                child: Text(widget.isAr ? 'تأكيد الدواء وعرض المعلومات' : 'Confirm & View Monograph'),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
