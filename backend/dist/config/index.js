import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const config = {
    port: parseInt(process.env.PORT || '4000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'salus_super_secret_jwt_key_2026_production_change_me',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    dbPath: process.env.DB_PATH || path.resolve(__dirname, '../../salus.db'),
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
    // Emergency numbers for Egypt
    emergencyAmbulanceEgypt: '123',
    emergencyGeneralEgypt: '112',
    edaBaseUrl: 'https://www.edaegypt.gov.eg/',
    dailyMedApiUrl: 'https://dailymed.nlm.nih.gov/dailymed/services/v2/',
    pubMedApiUrl: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/',
    openFdaApiUrl: 'https://api.fda.gov/drug/',
};
