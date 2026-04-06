const mongoose = require('mongoose');

const SimulationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  templateId: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard']
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed'],
    default: 'in_progress'
  },
  actions: [{
    actionType: { type: String, enum: ['click_link', 'enter_creds', 'report', 'ignore'] },
    timestamp: { type: Date, default: Date.now }
  }],
  score: {
    type: Number,
    default: 100 // Starts at 100, drops on mistakes
  },
  recommendations: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
});

module.exports = mongoose.model('Simulation', SimulationSchema);
