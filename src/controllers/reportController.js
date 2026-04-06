const ScanReport = require('../models/ScanReport');

exports.getReports = async (req, res) => {
    try {
        const filter = req.user && req.user.role === 'admin' ? {} : { user: req.user.id };
        
        // Allowed filters
        if (req.query.type) filter.type = req.query.type;
        if (req.query.riskLevel) filter.riskLevel = req.query.riskLevel;

        const limit = parseInt(req.query.limit, 10) || 10;
        const page = parseInt(req.query.page, 10) || 1;
        const skip = (page - 1) * limit;

        const total = await ScanReport.countDocuments(filter);
        const reports = await ScanReport.find(filter)
            .sort('-createdAt')
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            pagination: {
                total,
                limit,
                page,
                pages: Math.ceil(total / limit)
            },
            data: reports
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getReportById = async (req, res) => {
    try {
        const report = await ScanReport.findById(req.params.id);
        
        if (!report) {
            return res.status(404).json({ success: false, error: 'Report not found' });
        }

        // Authorization check
        if (report.user && report.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        res.status(200).json({ success: true, data: report });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.exportReports = async (req, res) => {
    try {
        const filter = req.user && req.user.role === 'admin' ? {} : { user: req.user.id };
        const reports = await ScanReport.find(filter).sort('-createdAt');
        
        res.setHeader('Content-disposition', 'attachment; filename=reports.json');
        res.setHeader('Content-type', 'application/json');
        res.status(200).send(JSON.stringify(reports, null, 2));
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
