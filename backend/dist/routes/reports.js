import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { compileReportData, generatePdfReport } from '../services/reportService.js';
import { directAuditLog } from '../middleware/audit.js';
export const reportsRouter = Router();
// GET /api/reports/summary - JSON summary of patient medication & symptoms
reportsRouter.get('/summary', authenticateToken, (req, res) => {
    const patientId = req.user.id;
    const data = compileReportData(patientId);
    directAuditLog(patientId, 'REPORT_SUMMARY_VIEWED', 'reports', data.reportId, 'Patient viewed structured health report');
    res.json({ report: data });
});
// GET /api/reports/download-pdf - Stream downloadable PDF
reportsRouter.get('/download-pdf', authenticateToken, async (req, res) => {
    try {
        const patientId = req.user.id;
        const data = compileReportData(patientId);
        const pdfBuffer = await generatePdfReport(data);
        directAuditLog(patientId, 'REPORT_PDF_DOWNLOADED', 'reports', data.reportId, 'Patient downloaded PDF report');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="SALUS_Report_${data.reportId}.pdf"`);
        res.send(pdfBuffer);
    }
    catch (err) {
        console.error('PDF generation error:', err);
        res.status(500).json({ error: 'Failed to generate PDF report' });
    }
});
