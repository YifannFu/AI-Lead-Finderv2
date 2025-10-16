const mongoose = require('mongoose');
const User = require('../src/models/User');
const Lead = require('../src/models/Lead');
require('dotenv').config();

// Sample data for demonstration
const sampleUsers = [
  {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john@techcorp.com',
    password: 'password123',
    company: 'TechCorp Inc',
    jobTitle: 'Sales Director',
    industry: 'Technology',
    subscription: {
      plan: 'Pro',
      leadsPerMonth: 1000,
      apiCallsPerMonth: 10000
    }
  },
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah@healthtech.com',
    password: 'password123',
    company: 'HealthTech Solutions',
    jobTitle: 'Marketing Manager',
    industry: 'Healthcare',
    subscription: {
      plan: 'Basic',
      leadsPerMonth: 500,
      apiCallsPerMonth: 5000
    }
  }
];

const sampleLeads = [
  {
    name: 'Mike Chen',
    email: 'mike.chen@innovateai.com',
    phone: '+1-555-0123',
    company: 'InnovateAI',
    jobTitle: 'CTO',
    industry: 'Technology',
    subIndustry: 'Artificial Intelligence',
    companySize: '51-200',
    companyRevenue: '$10M - $50M',
    companyWebsite: 'https://innovateai.com',
    companyLocation: {
      country: 'USA',
      state: 'California',
      city: 'San Francisco'
    },
    leadScore: 85,
    scoreFactors: [
      {
        factor: 'Job Title Relevance',
        weight: 0.3,
        value: 'High'
      },
      {
        factor: 'Company Size',
        weight: 0.2,
        value: 'Medium'
      },
      {
        factor: 'Industry Alignment',
        weight: 0.25,
        value: 'High'
      }
    ],
    aiAnalysis: {
      intent: 'High',
      painPoints: ['Scalability', 'Cost optimization', 'AI integration'],
      budget: 'High',
      timeline: '1-3 months',
      decisionMaker: true,
      sentiment: 'Positive'
    },
    source: 'LinkedIn',
    sourceUrl: 'https://linkedin.com/in/mikechen',
    tags: ['AI', 'Technology', 'High Priority'],
    priority: 'High',
    status: 'New'
  },
  {
    name: 'Emily Davis',
    email: 'emily.davis@healthplus.com',
    phone: '+1-555-0456',
    company: 'HealthPlus Medical',
    jobTitle: 'VP of Operations',
    industry: 'Healthcare',
    subIndustry: 'Medical Technology',
    companySize: '201-500',
    companyRevenue: '$50M - $100M',
    companyWebsite: 'https://healthplus.com',
    companyLocation: {
      country: 'USA',
      state: 'Texas',
      city: 'Austin'
    },
    leadScore: 78,
    scoreFactors: [
      {
        factor: 'Job Title Relevance',
        weight: 0.3,
        value: 'High'
      },
      {
        factor: 'Company Size',
        weight: 0.2,
        value: 'Large'
      },
      {
        factor: 'Industry Alignment',
        weight: 0.25,
        value: 'Medium'
      }
    ],
    aiAnalysis: {
      intent: 'Medium',
      painPoints: ['Compliance', 'Patient data management'],
      budget: 'Medium',
      timeline: '3-6 months',
      decisionMaker: true,
      sentiment: 'Neutral'
    },
    source: 'Apollo',
    sourceUrl: 'https://apollo.io/emily-davis',
    tags: ['Healthcare', 'Operations', 'Medium Priority'],
    priority: 'Medium',
    status: 'Contacted'
  },
  {
    name: 'David Wilson',
    email: 'david.wilson@fintech.com',
    phone: '+1-555-0789',
    company: 'FinTech Innovations',
    jobTitle: 'Head of Product',
    industry: 'Finance',
    subIndustry: 'Financial Technology',
    companySize: '11-50',
    companyRevenue: '$1M - $10M',
    companyWebsite: 'https://fintech-innovations.com',
    companyLocation: {
      country: 'USA',
      state: 'New York',
      city: 'New York'
    },
    leadScore: 72,
    scoreFactors: [
      {
        factor: 'Job Title Relevance',
        weight: 0.3,
        value: 'Medium'
      },
      {
        factor: 'Company Size',
        weight: 0.2,
        value: 'Small'
      },
      {
        factor: 'Industry Alignment',
        weight: 0.25,
        value: 'High'
      }
    ],
    aiAnalysis: {
      intent: 'Medium',
      painPoints: ['Regulatory compliance', 'User experience'],
      budget: 'Medium',
      timeline: '6+ months',
      decisionMaker: false,
      sentiment: 'Positive'
    },
    source: 'Company Website',
    sourceUrl: 'https://fintech-innovations.com/team',
    tags: ['FinTech', 'Product', 'Low Priority'],
    priority: 'Low',
    status: 'New'
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-lead-finder');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Lead.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const users = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      users.push(user);
      console.log(`Created user: ${user.email}`);
    }

    // Create leads for each user
    for (const user of users) {
      for (const leadData of sampleLeads) {
        const lead = new Lead({
          ...leadData,
          userId: user._id,
          discoveredAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
        });
        await lead.save();
        console.log(`Created lead: ${lead.name} for user: ${user.email}`);
      }
    }

    console.log('✅ Database seeded successfully!');
    console.log(`Created ${users.length} users and ${users.length * sampleLeads.length} leads`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedDatabase();
