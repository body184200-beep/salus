import { Router, Request, Response } from 'express';
import { fetchExternalEvidence } from '../services/externalSources.js';

export const externalRouter = Router();

// GET /api/external/evidence/:ingredient
externalRouter.get('/evidence/:ingredient', async (req: Request, res: Response) => {
  try {
    const ingredient = req.params.ingredient as string;
    const items = await fetchExternalEvidence(ingredient);
    res.json({
      ingredient,
      evidenceSources: items,
      regulatoryNotice:
        'Egyptian regulatory authority (EDA) guidelines prevail for Egyptian brand authorizations. U.S. DailyMed / openFDA records are integrated for structured clinical trial benchmarks and must not be assumed identical to local registration.',
      regulatoryNoticeAr:
        'تسري قرارات هيئة الدواء المصرية (EDA) للمستحضرات المسجلة في مصر. تُعرض مصادر DailyMed كمرجع دولي للدراسات الإكلينيكية الموثقة.',
    });
  } catch (err) {
    console.error('External sources error:', err);
    res.status(500).json({ error: 'Failed to retrieve external evidence sources' });
  }
});
