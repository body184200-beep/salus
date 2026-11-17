import '../data/salus_data.dart';
import '../models/models.dart';

class OcrMatchCandidate {
  final MedicationProduct product;
  final ActiveIngredient ingredient;
  final int confidenceScore; // 0 to 100
  final String confidenceLevel; // 'High', 'Medium', 'Low'
  final String matchReason;

  OcrMatchCandidate({
    required this.product,
    required this.ingredient,
    required this.confidenceScore,
    required this.confidenceLevel,
    required this.matchReason,
  });
}

class OcrService {
  static List<OcrMatchCandidate> scanText(String rawText) {
    final lower = rawText.toLowerCase();
    final List<OcrMatchCandidate> candidates = [];

    for (final prod in SalusData.products) {
      int score = 0;
      final reasons = <String>[];

      // Match brand name
      if (lower.contains(prod.brandNameEn.toLowerCase())) {
        score += 60;
        reasons.add('Brand "${prod.brandNameEn}" matched');
      }
      if (rawText.contains(prod.brandNameAr)) {
        score += 60;
        reasons.add('اسم تجاري "${prod.brandNameAr}"');
      }

      // Match strength (e.g. 5mg, 500mg, 10mg)
      final cleanStrength = prod.strength.toLowerCase().replaceAll(' ', '');
      if (lower.contains(cleanStrength)) {
        score += 25;
        reasons.add('Strength "${prod.strength}" matched');
      }

      if (score >= 40) {
        final ingredient = SalusData.ingredients.firstWhere(
          (ing) => ing.id == prod.activeIngredientId,
          orElse: () => SalusData.ingredients[0],
        );

        final finalScore = score > 92 ? 92 : score; // Never 100% without human confirmation!
        candidates.add(
          OcrMatchCandidate(
            product: prod,
            ingredient: ingredient,
            confidenceScore: finalScore,
            confidenceLevel: finalScore >= 75 ? 'High' : 'Medium',
            matchReason: reasons.join(' • '),
          ),
        );
      }
    }

    candidates.sort((a, b) => b.confidenceScore.compareTo(a.confidenceScore));
    return candidates;
  }
}
