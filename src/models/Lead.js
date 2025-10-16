const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  jobTitle: {
    type: String,
    trim: true
  },
  
  // Industry Classification
  industry: {
    type: String,
    required: true,
    enum: [
      'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
      'Retail', 'Real Estate', 'Consulting', 'Marketing', 'Legal',
      'Construction', 'Transportation', 'Energy', 'Media', 'Government',
      'Non-Profit', 'Agriculture', 'Hospitality', 'Sports', 'Entertainment'
    ]
  },
  subIndustry: {
    type: String,
    trim: true
  },
  
  // Company Information
  companySize: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
  },
  companyRevenue: {
    type: String,
    enum: ['< $1M', '$1M - $10M', '$10M - $50M', '$50M - $100M', '$100M - $500M', '> $500M']
  },
  companyWebsite: {
    type: String,
    trim: true
  },
  companyLocation: {
    country: String,
    state: String,
    city: String,
    address: String
  },
  
  // Lead Scoring
  leadScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  scoreFactors: [{
    factor: String,
    weight: Number,
    value: mongoose.Schema.Types.Mixed
  }],
  
  // AI Analysis
  aiAnalysis: {
    intent: {
      type: String,
      enum: ['High', 'Medium', 'Low', 'Unknown']
    },
    painPoints: [String],
    budget: {
      type: String,
      enum: ['High', 'Medium', 'Low', 'Unknown']
    },
    timeline: {
      type: String,
      enum: ['Immediate', '1-3 months', '3-6 months', '6+ months', 'Unknown']
    },
    decisionMaker: {
      type: Boolean,
      default: false
    },
    sentiment: {
      type: String,
      enum: ['Positive', 'Neutral', 'Negative']
    }
  },
  
  // Source Information
  source: {
    type: String,
    required: true,
    enum: ['LinkedIn', 'Company Website', 'Industry Database', 'Social Media', 'News', 'API', 'Manual']
  },
  sourceUrl: String,
  discoveredAt: {
    type: Date,
    default: Date.now
  },
  
  // Contact History
  contactHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['Email', 'Phone', 'LinkedIn', 'Meeting', 'Other']
    },
    status: {
      type: String,
      enum: ['Sent', 'Opened', 'Replied', 'Bounced', 'Unsubscribed']
    },
    notes: String
  }],
  
  // Tags and Categories
  tags: [String],
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  
  // User Association
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
    default: 'New'
  },
  
  // Metadata
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
leadSchema.index({ email: 1 });
leadSchema.index({ company: 1 });
leadSchema.index({ industry: 1 });
leadSchema.index({ leadScore: -1 });
leadSchema.index({ userId: 1, status: 1 });
leadSchema.index({ discoveredAt: -1 });

// Virtual for full name
leadSchema.virtual('fullName').get(function() {
  return `${this.name}`;
});

// Method to calculate lead score
leadSchema.methods.calculateScore = function() {
  let score = 0;
  
  // Base score from AI analysis
  if (this.aiAnalysis.intent === 'High') score += 30;
  else if (this.aiAnalysis.intent === 'Medium') score += 20;
  else if (this.aiAnalysis.intent === 'Low') score += 10;
  
  if (this.aiAnalysis.budget === 'High') score += 25;
  else if (this.aiAnalysis.budget === 'Medium') score += 15;
  else if (this.aiAnalysis.budget === 'Low') score += 5;
  
  if (this.aiAnalysis.timeline === 'Immediate') score += 20;
  else if (this.aiAnalysis.timeline === '1-3 months') score += 15;
  else if (this.aiAnalysis.timeline === '3-6 months') score += 10;
  
  if (this.aiAnalysis.decisionMaker) score += 15;
  
  // Company size factor
  if (this.companySize === '1000+') score += 10;
  else if (this.companySize === '501-1000') score += 8;
  else if (this.companySize === '201-500') score += 6;
  
  // Contact information completeness
  if (this.email && this.phone) score += 5;
  else if (this.email) score += 3;
  
  this.leadScore = Math.min(score, 100);
  return this.leadScore;
};

// Pre-save middleware
leadSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  if (this.isModified('aiAnalysis') || this.isModified('companySize') || this.isModified('email') || this.isModified('phone')) {
    this.calculateScore();
  }
  next();
});

module.exports = mongoose.model('Lead', leadSchema);
