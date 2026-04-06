const ScanReport = require('../models/ScanReport');

exports.getStats = async (req, res) => {
    try {
        // Build query based on user (if not admin, only see their own stats)
        const filter = req.user && req.user.role === 'admin' ? {} : { user: req.user.id };

        const totalScans = await ScanReport.countDocuments(filter);
        const threatsDetected = await ScanReport.countDocuments({ ...filter, riskLevel: { $in: ['suspicious', 'dangerous'] } });
        
        const aggregation = await ScanReport.aggregate([
            { $match: filter },
            { $group: { _id: null, avgRisk: { $avg: '$overallRiskScore' } } }
        ]);

        const avgRiskScore = aggregation.length > 0 ? Math.round(aggregation[0].avgRisk) : 0;

        res.status(200).json({
            success: true,
            data: {
                totalScans,
                threatsDetected,
                avgRiskScore,
                safeRate: totalScans > 0 ? Math.round(((totalScans - threatsDetected) / totalScans) * 100) : 100
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getFeed = async (req, res) => {
    try {
        const filter = req.user && req.user.role === 'admin' ? {} : { user: req.user.id };
        const limit = parseInt(req.query.limit, 10) || 5;

        const recentScans = await ScanReport.find(filter)
            .sort('-createdAt')
            .limit(limit)
            .select('type inputData riskLevel createdAt');

        res.status(200).json({
            success: true,
            data: recentScans
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getCharts = async (req, res) => {
    try {
        const filter = req.user && req.user.role === 'admin' ? {} : { user: req.user.id };
        
        // Example: count by type
        const typeAggregation = await ScanReport.aggregate([
            { $match: filter },
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);

        // Example: count by risk level
        const riskAggregation = await ScanReport.aggregate([
            { $match: filter },
            { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                scanTypes: typeAggregation,
                riskLevels: riskAggregation
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
