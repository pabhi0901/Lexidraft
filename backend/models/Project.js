const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    projectTitle: {
      type: String,
      required: [true, 'Please add a project title'],
      trim: true,
    },
    projectDescription: {
      type: String,
      required: [true, 'Please add project description'],
    },
    technologies: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      trim: true,
    },
    keyFeatures: {
      type: String,
    },
    tone: {
      type: String,
      enum: ['confident', 'professional', 'hiring-friendly', 'technical', 'creative'],
      default: 'professional',
    },
    generatedBulletPoints: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Project', projectSchema);
