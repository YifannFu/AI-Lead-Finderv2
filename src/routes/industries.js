const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Apply authentication middleware
router.use(authMiddleware);

// Get available industries
router.get('/', (req, res) => {
  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
    'Retail', 'Real Estate', 'Consulting', 'Marketing', 'Legal',
    'Construction', 'Transportation', 'Energy', 'Media', 'Government',
    'Non-Profit', 'Agriculture', 'Hospitality', 'Sports', 'Entertainment'
  ];

  res.json({
    success: true,
    industries
  });
});

// Get industry-specific keywords
router.get('/:industry/keywords', (req, res) => {
  const { industry } = req.params;
  
  const industryKeywords = {
    'Technology': ['software', 'SaaS', 'cloud', 'AI', 'machine learning', 'cybersecurity', 'devops'],
    'Healthcare': ['medical', 'healthcare', 'pharmaceutical', 'telemedicine', 'health tech', 'clinical'],
    'Finance': ['fintech', 'banking', 'investment', 'trading', 'blockchain', 'payments', 'insurance'],
    'Education': ['edtech', 'online learning', 'educational technology', 'e-learning', 'training'],
    'Manufacturing': ['automation', 'industrial', 'supply chain', 'logistics', 'production'],
    'Retail': ['e-commerce', 'retail tech', 'omnichannel', 'inventory', 'customer experience'],
    'Real Estate': ['proptech', 'real estate tech', 'property management', 'commercial real estate'],
    'Consulting': ['management consulting', 'strategy', 'advisory', 'business consulting'],
    'Marketing': ['digital marketing', 'advertising', 'marketing automation', 'content marketing'],
    'Legal': ['legal tech', 'law firm', 'compliance', 'legal services', 'litigation'],
    'Construction': ['construction tech', 'building', 'infrastructure', 'project management'],
    'Transportation': ['logistics', 'fleet management', 'transportation tech', 'shipping'],
    'Energy': ['renewable energy', 'oil and gas', 'utilities', 'energy management'],
    'Media': ['digital media', 'content creation', 'streaming', 'publishing', 'broadcasting'],
    'Government': ['government tech', 'public sector', 'civic tech', 'government services'],
    'Non-Profit': ['nonprofit', 'charity', 'social impact', 'foundation', 'NGO'],
    'Agriculture': ['agtech', 'farming', 'agricultural technology', 'food production'],
    'Hospitality': ['hotel tech', 'restaurant', 'tourism', 'hospitality management'],
    'Sports': ['sports tech', 'fitness', 'athletics', 'sports management'],
    'Entertainment': ['entertainment tech', 'gaming', 'music', 'film', 'events']
  };

  const keywords = industryKeywords[industry] || [];
  
  res.json({
    success: true,
    industry,
    keywords
  });
});

// Get industry statistics
router.get('/:industry/stats', async (req, res) => {
  try {
    const { industry } = req.params;
    const userId = req.user.id;
    
    const Lead = require('../models/Lead');
    
    const stats = await Lead.aggregate([
      { $match: { userId: userId, industry: industry, isActive: true } },
      {
        $group: {
          _id: null,
          totalLeads: { $sum: 1 },
          avgScore: { $avg: '$leadScore' },
          highScoreLeads: {
            $sum: { $cond: [{ $gte: ['$leadScore', 80] }, 1, 0] }
          },
          qualifiedLeads: {
            $sum: { $cond: [{ $eq: ['$status', 'Qualified'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      industry,
      stats: stats[0] || {
        totalLeads: 0,
        avgScore: 0,
        highScoreLeads: 0,
        qualifiedLeads: 0
      }
    });
  } catch (error) {
    console.error('Error getting industry stats:', error);
    res.status(500).json({
      error: 'Failed to get industry statistics',
      message: error.message
    });
  }
});

module.exports = router;
