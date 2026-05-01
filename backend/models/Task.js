const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, enum: ['Coding', 'Behavioral', 'System Design', 'Networking'], default: 'Coding' },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  scheduledDate: { type: Date, default: Date.now },
  isAIResult: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
