const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    recipientEmail: {
      type: String,
      required: [true, 'Please add recipient email'],
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    recipientName: {
      type: String,
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    position: {
      type: String,
      trim: true,
    },
    userContent: {
      type: String,
      required: [true, 'Please add email content'],
    },
    tone: {
      type: String,
      enum: ['confident', 'professional', 'hiring-friendly', 'technical', 'creative'],
      default: 'professional',
    },
    generatedSubject: {
      type: String,
      default: '',
    },
    generatedContent: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['draft', 'sent'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Email', emailSchema);
