import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { authRouter } from './routes/auth.js';
import { medicationsRouter } from './routes/medications.js';
import { symptomsRouter } from './routes/symptoms.js';
import { consentRouter } from './routes/consent.js';
import { pharmacistRouter } from './routes/pharmacist.js';
import { assistantRouter } from './routes/assistant.js';
import { ocrRouter } from './routes/ocr.js';
import { reportsRouter } from './routes/reports.js';
import { externalRouter } from './routes/external.js';

export const app = express();

app.use(cors({
  origin: true, // Allow frontend dev and preview origins
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiter
app.use(rateLimiter);

// API Status & OpenAPI Metadata
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    product: 'SALUS (سالوس)',
    version: '1.0.0',
    scope: '9 Active Ingredients (Hypertension, Diabetes, Pain Relief / NSAIDs)',
    market: 'Egypt (Initial) / International',
    timestamp: new Date().toISOString(),
    supportedEndpoints: [
      '/api/auth/register',
      '/api/auth/login',
      '/api/auth/me',
      '/api/medications/categories',
      '/api/medications/search',
      '/api/medications/:id',
      '/api/symptoms',
      '/api/consent/invite',
      '/api/consent/my-grants',
      '/api/pharmacist/patients',
      '/api/pharmacist/patient/:patientId/records',
      '/api/assistant/query',
      '/api/ocr/scan',
      '/api/reports/summary',
      '/api/reports/download-pdf',
      '/api/external/evidence/:ingredient',
    ],
  });
});

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/medications', medicationsRouter);
app.use('/api/symptoms', symptomsRouter);
app.use('/api/consent', consentRouter);
app.use('/api/pharmacist', pharmacistRouter);
app.use('/api/assistant', assistantRouter);
app.use('/api/ocr', ocrRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/external', externalRouter);

// 404 Not Found Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint not found',
    errorAr: 'المسار المطلوب غير موجود',
    path: req.originalUrl,
  });
});

// Central Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    errorAr: 'حدث خطأ غير متوقع في الخادم',
  });
});

// Serve frontend static build if available
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDist = path.resolve(__dirname, '../../frontend/dist');

if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

