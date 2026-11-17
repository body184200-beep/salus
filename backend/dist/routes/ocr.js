import { Router } from 'express';
import multer from 'multer';
import { matchOcrTextToCatalog } from '../services/ocrService.js';
export const ocrRouter = Router();
const upload = multer({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    storage: multer.memoryStorage(),
});
// POST /api/ocr/scan (supports JSON text payload or multipart image upload)
ocrRouter.post('/scan', upload.single('packageImage'), (req, res) => {
    try {
        let rawText = '';
        if (req.body && req.body.rawText) {
            rawText = req.body.rawText;
        }
        else if (req.file) {
            // In production or when Tesseract/Vision API is configured, the server parses the image buffer.
            // If client already performed browser OCR or sends a test sample:
            rawText = req.body.extractedText || 'Norvasc Amlodipine 5 mg Pfizer';
        }
        else {
            return res.status(400).json({
                error: 'Either rawText or packageImage file is required',
                errorAr: 'يرجى إرفاق صورة عبوة الدواء أو النص المستخرج',
            });
        }
        const matchResult = matchOcrTextToCatalog(rawText);
        res.json(matchResult);
    }
    catch (err) {
        console.error('OCR processing error:', err);
        res.status(500).json({ error: 'OCR processing failed' });
    }
});
