const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
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
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // Company Information
  company: {
    type: String,
    required: true,
    trim: true
  },
  jobTitle: {
    type: String,
    trim: true
  },
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
  
  // Preferences
  preferences: {
    targetIndustries: [{
      type: String,
      enum: [
        'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
        'Retail', 'Real Estate', 'Consulting', 'Marketing', 'Legal',
        'Construction', 'Transportation', 'Energy', 'Media', 'Government',
        'Non-Profit', 'Agriculture', 'Hospitality', 'Sports', 'Entertainment'
      ]
    }],
    targetCompanySizes: [{
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
    }],
    targetLocations: [String],
    keywords: [String],
    excludeKeywords: [String]
  },
  
  // Subscription and Limits
  subscription: {
    plan: {
      type: String,
      enum: ['Free', 'Basic', 'Pro', 'Enterprise'],
      default: 'Free'
    },
    leadsPerMonth: {
      type: Number,
      default: 100
    },
    apiCallsPerMonth: {
      type: Number,
      default: 1000
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date
  },
  
  // Usage Tracking
  usage: {
    leadsGenerated: {
      type: Number,
      default: 0
    },
    apiCallsUsed: {
      type: Number,
      default: 0
    },
    lastReset: {
      type: Date,
      default: Date.now
    }
  },
  
  // API Keys and Integrations
  integrations: {
    linkedin: {
      apiKey: String,
      connected: {
        type: Boolean,
        default: false
      }
    },
    apollo: {
      apiKey: String,
      connected: {
        type: Boolean,
        default: false
      }
    },
    hunter: {
      apiKey: String,
      connected: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // Settings
  settings: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    weeklyReports: {
      type: Boolean,
      default: true
    },
    autoScoring: {
      type: Boolean,
      default: true
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ company: 1 });
userSchema.index({ industry: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if user can generate more leads
userSchema.methods.canGenerateLeads = function() {
  const now = new Date();
  const lastReset = new Date(this.usage.lastReset);
  
  // Reset usage if it's a new month
  if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    this.usage.leadsGenerated = 0;
    this.usage.apiCallsUsed = 0;
    this.usage.lastReset = now;
    return true;
  }
  
  return this.usage.leadsGenerated < this.subscription.leadsPerMonth;
};

// Check if user can make API calls
userSchema.methods.canMakeApiCall = function() {
  const now = new Date();
  const lastReset = new Date(this.usage.lastReset);
  
  // Reset usage if it's a new month
  if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    this.usage.leadsGenerated = 0;
    this.usage.apiCallsUsed = 0;
    this.usage.lastReset = now;
    return true;
  }
  
  return this.usage.apiCallsUsed < this.subscription.apiCallsPerMonth;
};

// Increment usage
userSchema.methods.incrementUsage = function(type = 'leads') {
  if (type === 'leads') {
    this.usage.leadsGenerated += 1;
  } else if (type === 'api') {
    this.usage.apiCallsUsed += 1;
  }
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
