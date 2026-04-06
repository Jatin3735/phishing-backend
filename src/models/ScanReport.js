const mongoose = require('mongoose');

const ScanReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false // Allow anonymous scans if we want
  },
  type: {
    type: String,
    enum: ['url', 'message', 'screenshot'],
    required: true
  },
  inputData: {
    type: String, // could be URL, message text, or filename of screenshot
    required: true
  },
  overallRiskScore: {
    type: Number,
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['safe', 'suspicious', 'dangerous'],
    required: true
  },
  details: {
    type: Object, // Store specific scanner results here
    required: true
  },
  dnaReport: {
    urgencyScore: { type: Number, default: 0 },
    fearScore: { type: Number, default: 0 },
    brandImpersonationScore: { type: Number, default: 0 },
    linkManipulationScore: { type: Number, default: 0 },
    socialEngineeringScore: { type: Number, default: 0 }
  },
  recommendations: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ScanReport', ScanReportSchema);
