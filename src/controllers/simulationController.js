const Simulation = require('../models/Simulation');

const templates = [
    {
        id: 'tpl_1',
        name: 'Urgent Password Reset',
        difficulty: 'easy',
        sender: 'Security <no-reply@paypa1.co>',
        subject: 'URGENT: Unauthorized access to your account',
        body: 'Dear user, we noticed an unauthorized login. Click here immediately to reset your password.',
        trick: 'brand impersonation (paypa1 instead of paypal) and urgency'
    },
    {
        id: 'tpl_2',
        name: 'Package Delivery Failed',
        difficulty: 'medium',
        sender: 'FedEx Tracking <delivery@track-fedex-shipment.com>',
        subject: 'Cannot deliver your package',
        body: 'Your package is on hold. Please pay a small fee of $1.99 to reschedule delivery.',
        trick: 'lookalike domain and greed/trust'
    }
];

exports.getTemplates = (req, res) => {
    res.status(200).json({ success: true, data: templates });
};

exports.startSimulation = async (req, res) => {
    try {
        const { templateId } = req.body;
        const template = templates.find(t => t.id === templateId);

        if (!template) {
            return res.status(404).json({ success: false, error: 'Template not found' });
        }

        const sim = await Simulation.create({
            user: req.user.id,
            templateId,
            difficulty: template.difficulty
        });

        res.status(201).json({ success: true, data: sim, template });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.trackAction = async (req, res) => {
    try {
        const { simId, actionType } = req.body;

        const sim = await Simulation.findById(simId);
        if (!sim) return res.status(404).json({ success: false, error: 'Simulation not found' });

        if (sim.user.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        sim.actions.push({ actionType });

        // Scoring logic
        if (actionType === 'click_link') {
            sim.score -= 40;
            sim.recommendations.push('You clicked a suspicious link. Always hover over links to check the destination.');
        } else if (actionType === 'enter_creds') {
            sim.score -= 60;
            sim.recommendations.push('You entered credentials on a fake site. Never provide passwords from an email link.');
        } else if (actionType === 'report' || actionType === 'ignore') {
            // Keep score at 100 or current
            sim.status = 'completed';
            sim.completedAt = Date.now();
            sim.recommendations.push('Good job identifying the phishing attempt!');
        }

        // Clamp score
        sim.score = Math.max(0, sim.score);

        await sim.save();

        res.status(200).json({ success: true, data: sim });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getResult = async (req, res) => {
     try {
        const sim = await Simulation.findById(req.params.id);
        if (!sim) return res.status(404).json({ success: false, error: 'Simulation not found' });

        if (sim.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        // If not completed yet, complete it implicitly
        if (sim.status !== 'completed') {
             sim.status = 'completed';
             sim.completedAt = Date.now();
             await sim.save();
        }

        res.status(200).json({ success: true, data: sim });
     } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
