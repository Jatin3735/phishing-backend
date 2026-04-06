const urlScannerService = require('../services/urlScannerService');
const messageScannerService = require('../services/messageScannerService');
const ocrService = require('../services/ocrService');
const ScanReport = require('../models/ScanReport');

// Helper to generate recommendations
const generateRecommendations = (riskLevel, dna) => {
    let recs = [];
    if (riskLevel === 'safe') {
        recs.push('Link/Message appears safe, but always verify the sender.');
    } else {
        recs.push('Do NOT click on any links or download attachments.');
        if (dna.urgencyScore > 50 || dna.fearScore > 50) {
            recs.push('Notice the emotional manipulation. Take a breath and do not respond immediately.');
        }
        if (dna.brandImpersonationScore > 50) {
            recs.push('This message is likely pretending to be a trusted brand. Go to their official app or website directly instead of trusting this message.');
        }
    }
    return recs;
};

exports.scanUrl = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ success: false, error: 'URL is required' });

        const result = await urlScannerService.scanUrl(url);

        // Map to DNA
        const dna = {
            linkManipulationScore: result.score,
            brandImpersonationScore: result.reasons.some(r => r.includes('brand impersonation')) ? 80 : 0
        };

        const report = await ScanReport.create({
            user: req.user ? req.user.id : null,
            type: 'url',
            inputData: url,
            overallRiskScore: result.score,
            riskLevel: result.riskLevel,
            details: result,
            dnaReport: dna,
            recommendations: generateRecommendations(result.riskLevel, dna)
        });

        res.status(200).json({ success: true, data: report });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.scanMessage = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ success: false, error: 'Text is required' });

        const result = messageScannerService.scanMessage(text);

        const dna = {
            urgencyScore: result.tricksBreakdown.urgency,
            fearScore: result.tricksBreakdown.fear,
            socialEngineeringScore: result.manipulationScore
        };

        let riskLevel = 'safe';
        if (result.manipulationScore >= 60) riskLevel = 'dangerous';
        else if (result.manipulationScore >= 30) riskLevel = 'suspicious';

        const report = await ScanReport.create({
            user: req.user ? req.user.id : null,
            type: 'message',
            inputData: text.substring(0, 100), // Only save first 100 chars
            overallRiskScore: result.manipulationScore,
            riskLevel: riskLevel,
            details: result,
            dnaReport: dna,
            recommendations: generateRecommendations(riskLevel, dna)
        });

        res.status(200).json({ success: true, data: report });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.scanScreenshot = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No image uploaded' });
        }

        // Extract text via OCR
        const extractedText = await ocrService.extractTextFromImage(req.file.path);
        
        // Scan the extracted text just like a message
        const result = messageScannerService.scanMessage(extractedText);

        const dna = {
            urgencyScore: result.tricksBreakdown.urgency,
            fearScore: result.tricksBreakdown.fear,
            socialEngineeringScore: result.manipulationScore
        };

        let riskLevel = 'safe';
        if (result.manipulationScore >= 60) riskLevel = 'dangerous';
        else if (result.manipulationScore >= 30) riskLevel = 'suspicious';

        const report = await ScanReport.create({
            user: req.user ? req.user.id : null,
            type: 'screenshot',
            inputData: req.file.filename,
            overallRiskScore: result.manipulationScore,
            riskLevel: riskLevel,
            details: { ...result, extractedText },
            dnaReport: dna,
            recommendations: generateRecommendations(riskLevel, dna)
        });

        res.status(200).json({ success: true, data: report });
    } catch (err) {
        if (req.file && require('fs').existsSync(req.file.path)) {
             require('fs').unlinkSync(req.file.path);
        }
        res.status(500).json({ success: false, error: err.message });
    }
};
