import { db } from '../db/database.js';

export interface OcrCandidateMatch {
  productId?: string;
  activeIngredientId: string;
  brandNameEn: string;
  brandNameAr: string;
  activeIngredientEn: string;
  activeIngredientAr: string;
  strength: string;
  formulation: string;
  confidenceScore: number; // 0 to 100%
  confidenceLevel: 'High' | 'Medium' | 'Low';
  matchReason: string;
  isVerifiedEgyptian: boolean;
}

export interface OcrProcessResult {
  extractedRawText: string;
  detectedStrength?: string;
  detectedFormulation?: string;
  candidates: OcrCandidateMatch[];
  requiresUserConfirmation: boolean;
  uncertaintyWarningEn: string;
  uncertaintyWarningAr: string;
  fallbackManualSearchUrl: string;
}

export function matchOcrTextToCatalog(rawText: string): OcrProcessResult {
  const normalized = rawText.toLowerCase().replace(/[\r\n]+/g, ' ');

  // Extract common strengths (e.g. 5 mg, 10mg, 500 mg, 1000mg, 400 mg)
  const strengthMatch = rawText.match(/\b(\d+(\.\d+)?)\s*(mg|مجم|g|جرام|mcg)\b/i);
  const detectedStrength = strengthMatch ? strengthMatch[0] : undefined;

  // Extract formulations (tablet, capsule, syrup, أقراص, كبسول, etc.)
  let detectedFormulation: string | undefined;
  if (/tablet|tab|قرص|أقراص/i.test(rawText)) detectedFormulation = 'Tablet / أقراص';
  else if (/capsule|cap|كبسول/i.test(rawText)) detectedFormulation = 'Capsule / كبسولات';
  else if (/suppository|لبوس/i.test(rawText)) detectedFormulation = 'Suppository / لبوس';

  // Load all products and active ingredients
  const products = db.prepare(`
    SELECT p.*, a.name_en as active_name_en, a.name_ar as active_name_ar, a.id as ingredient_id
    FROM medication_products p
    JOIN active_ingredients a ON p.active_ingredient_id = a.id
  `).all() as any[];

  const ingredients = db.prepare('SELECT * FROM active_ingredients').all() as any[];

  const scoredCandidates: OcrCandidateMatch[] = [];

  // 1. Check Egyptian Products / Brands
  for (const prod of products) {
    let score = 0;
    const reasons: string[] = [];

    const brandEn = prod.brand_name_en.toLowerCase();
    const brandAr = prod.brand_name_ar;

    // Check exact brand match
    if (normalized.includes(brandEn)) {
      score += 55;
      reasons.push(`Brand name '${prod.brand_name_en}' matched`);
    } else {
      // Check partial brand match
      const brandParts = brandEn.split(' ');
      for (const part of brandParts) {
        if (part.length >= 4 && normalized.includes(part)) {
          score += 35;
          reasons.push(`Partial brand name match '${part}'`);
          break;
        }
      }
    }

    if (rawText.includes(brandAr)) {
      score += 55;
      reasons.push(`Arabic brand name '${prod.brand_name_ar}' matched`);
    }

    // Check active ingredient match
    if (normalized.includes(prod.active_name_en.toLowerCase())) {
      score += 30;
      reasons.push(`Active ingredient '${prod.active_name_en}' matched`);
    }
    if (rawText.includes(prod.active_name_ar)) {
      score += 30;
      reasons.push(`Arabic active ingredient '${prod.active_name_ar}' matched`);
    }

    // Check strength match
    if (detectedStrength && prod.strength.toLowerCase().includes(detectedStrength.toLowerCase().replace(/\s+/g, ''))) {
      score += 15;
      reasons.push(`Strength '${prod.strength}' matched`);
    }

    if (score > 25) {
      const finalScore = Math.min(score, 95); // Never 100% without patient human confirmation!
      let confidenceLevel: 'High' | 'Medium' | 'Low' = 'Low';
      if (finalScore >= 70) confidenceLevel = 'High';
      else if (finalScore >= 45) confidenceLevel = 'Medium';

      scoredCandidates.push({
        productId: prod.id,
        activeIngredientId: prod.active_ingredient_id,
        brandNameEn: prod.brand_name_en,
        brandNameAr: prod.brand_name_ar,
        activeIngredientEn: prod.active_name_en,
        activeIngredientAr: prod.active_name_ar,
        strength: prod.strength,
        formulation: prod.formulation,
        confidenceScore: finalScore,
        confidenceLevel,
        matchReason: reasons.join('; '),
        isVerifiedEgyptian: prod.is_verified_egyptian === 1,
      });
    }
  }

  // 2. If no products matched with high score, check generic active ingredients
  if (scoredCandidates.length === 0) {
    for (const ing of ingredients) {
      let score = 0;
      const reasons: string[] = [];

      if (normalized.includes(ing.name_en.toLowerCase())) {
        score += 65;
        reasons.push(`Generic name '${ing.name_en}' found`);
      }
      if (rawText.includes(ing.name_ar)) {
        score += 65;
        reasons.push(`Arabic generic name '${ing.name_ar}' found`);
      }

      if (score > 0) {
        scoredCandidates.push({
          activeIngredientId: ing.id,
          brandNameEn: ing.name_en,
          brandNameAr: ing.name_ar,
          activeIngredientEn: ing.name_en,
          activeIngredientAr: ing.name_ar,
          strength: detectedStrength || 'Unspecified strength',
          formulation: detectedFormulation || 'Oral dosage form',
          confidenceScore: Math.min(score, 75),
          confidenceLevel: score >= 60 ? 'Medium' : 'Low',
          matchReason: reasons.join('; '),
          isVerifiedEgyptian: true,
        });
      }
    }
  }

  // Sort by confidence score descending
  scoredCandidates.sort((a, b) => b.confidenceScore - a.confidenceScore);

  return {
    extractedRawText: rawText,
    detectedStrength,
    detectedFormulation,
    candidates: scoredCandidates,
    requiresUserConfirmation: true, // Always require confirmation per safety rules
    uncertaintyWarningEn:
      'CRITICAL SAFETY CHECK: OCR packaging text recognition may contain errors due to lighting, angle, or packaging condition. You must confirm that the selected medicine exactly matches your package before viewing clinical information.',
    uncertaintyWarningAr:
      'تنبيه أمان هام: قراءة النص من عبوة الدواء عبر الكاميرا قد تحتوي على أخطاء بسبب الإضاءة أو وضوح العلبة. يجب أن تؤكد بنفسك تطابق الدواء المختار مع علبة الدواء الخاصة بك قبل استعراض المعلومات الطبية.',
    fallbackManualSearchUrl: '/medications',
  };
}
