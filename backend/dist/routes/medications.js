import { Router } from 'express';
import { db } from '../db/database.js';
export const medicationsRouter = Router();
// GET /api/medications/categories
medicationsRouter.get('/categories', (req, res) => {
    const categories = db.prepare('SELECT * FROM medication_categories ORDER BY name_en').all();
    res.json({ categories });
});
// GET /api/medications/search
medicationsRouter.get('/search', (req, res) => {
    const query = (req.query.q || '').trim().toLowerCase();
    const categoryId = req.query.category;
    let sql = `
    SELECT 
      a.id as ingredient_id,
      a.name_en as generic_name_en,
      a.name_ar as generic_name_ar,
      a.drug_class_en,
      a.drug_class_ar,
      a.is_nsaid,
      a.general_purpose_en,
      a.general_purpose_ar,
      a.warnings_en,
      a.warnings_ar,
      a.interactions_en,
      a.interactions_ar,
      a.last_reviewed_date,
      c.id as category_id,
      c.name_en as category_name_en,
      c.name_ar as category_name_ar
    FROM active_ingredients a
    JOIN medication_categories c ON a.category_id = c.id
    WHERE 1=1
  `;
    const params = [];
    if (categoryId) {
        sql += ' AND a.category_id = ?';
        params.push(categoryId);
    }
    const allIngredients = db.prepare(sql).all(...params);
    // Also query Egyptian products to match by brand name
    const allProducts = db.prepare(`
    SELECT p.*, a.id as active_ingredient_id
    FROM medication_products p
    JOIN active_ingredients a ON p.active_ingredient_id = a.id
  `).all();
    // If no query, return all
    if (!query) {
        const results = allIngredients.map((ing) => {
            const products = allProducts.filter((p) => p.active_ingredient_id === ing.ingredient_id);
            return {
                ...ing,
                is_nsaid: ing.is_nsaid === 1,
                matchedByBrand: false,
                egyptianProducts: products,
            };
        });
        return res.json({ results, total: results.length });
    }
    // Filter with fuzzy/transliteration support
    const matched = allIngredients.filter((ing) => {
        const nameEn = ing.generic_name_en.toLowerCase();
        const nameAr = ing.generic_name_ar;
        const purposeEn = ing.general_purpose_en.toLowerCase();
        const drugClassEn = ing.drug_class_en.toLowerCase();
        // Check generic name
        if (nameEn.includes(query) || nameAr.includes(query) || purposeEn.includes(query) || drugClassEn.includes(query)) {
            return true;
        }
        // Check Egyptian brand names (e.g. Norvasc, Concor, Glucophage, Panadol, Brufen, Cataflam)
        const matchingBrand = allProducts.some((p) => p.active_ingredient_id === ing.ingredient_id &&
            (p.brand_name_en.toLowerCase().includes(query) || p.brand_name_ar.includes(query)));
        return matchingBrand;
    });
    const enrichedResults = matched.map((ing) => {
        const products = allProducts.filter((p) => p.active_ingredient_id === ing.ingredient_id);
        const matchingBrandNames = products
            .filter((p) => p.brand_name_en.toLowerCase().includes(query) || p.brand_name_ar.includes(query))
            .map((p) => `${p.brand_name_en} (${p.brand_name_ar})`);
        return {
            ...ing,
            is_nsaid: ing.is_nsaid === 1,
            matchedByBrand: matchingBrandNames.length > 0,
            matchedBrandExamples: matchingBrandNames,
            egyptianProducts: products,
        };
    });
    res.json({
        query,
        results: enrichedResults,
        total: enrichedResults.length,
        requiresConfirmationIfMultiple: enrichedResults.length > 1,
    });
});
// GET /api/medications/:id (Detailed Clinical Monograph)
medicationsRouter.get('/:id', (req, res) => {
    const id = req.params.id;
    const ingredient = db.prepare(`
    SELECT a.*, c.name_en as category_name_en, c.name_ar as category_name_ar
    FROM active_ingredients a
    JOIN medication_categories c ON a.category_id = c.id
    WHERE a.id = ?
  `).get(id);
    if (!ingredient) {
        return res.status(404).json({
            error: 'Medication not found in verified scope',
            errorAr: 'الدواء غير موجود في النطاق الموثق حالياً',
            unsupportedNoticeAr: 'المعلومة دي مش متوفرة بشكل موثوق حاليًا.',
            unsupportedNoticeEn: 'Reliable information is not currently available.',
        });
    }
    // Fetch verified Egyptian brand products
    const products = db.prepare(`
    SELECT * FROM medication_products
    WHERE active_ingredient_id = ?
    ORDER BY brand_name_en
  `).all(id);
    // Fetch verified adverse effects
    const adverseEffects = db.prepare(`
    SELECT * FROM adverse_effects
    WHERE active_ingredient_id = ?
    ORDER BY frequency_percentage DESC
  `).all(id);
    res.json({
        medication: {
            ...ingredient,
            is_nsaid: ingredient.is_nsaid === 1,
            egyptianProducts: products,
            adverseEffects: adverseEffects.map((ae) => ({
                ...ae,
                sampleSize: ae.sample_size_denominator || 'Not established',
                comparator: ae.comparator || 'Not established',
            })),
            evidenceSource: 'US FDA DailyMed & Egyptian Drug Authority (EDA)',
            lastReviewedDate: ingredient.last_reviewed_date,
        },
    });
});
// GET /api/medications/products/:id
medicationsRouter.get('/products/:id', (req, res) => {
    const product = db.prepare(`
    SELECT p.*, a.name_en as active_name_en, a.name_ar as active_name_ar, a.id as active_ingredient_id, a.drug_class_en, a.drug_class_ar, a.is_nsaid
    FROM medication_products p
    JOIN active_ingredients a ON p.active_ingredient_id = a.id
    WHERE p.id = ?
  `).get(req.params.id);
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    res.json({
        product: {
            ...product,
            is_nsaid: product.is_nsaid === 1,
        },
    });
});
