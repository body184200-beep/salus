import { Router } from 'express';
import { processAssistantQuery } from '../services/voiceAssistant.js';
export const assistantRouter = Router();
// POST /api/assistant/query
assistantRouter.post('/query', (req, res) => {
    const { query, language = 'ar' } = req.body;
    if (!query || typeof query !== 'string') {
        return res.status(400).json({
            error: 'Query parameter is required',
            errorAr: 'يرجى إدخال السؤال أو الاستفسار الدوائي',
        });
    }
    const result = processAssistantQuery(query, language === 'en' ? 'en' : 'ar');
    res.json(result);
});
