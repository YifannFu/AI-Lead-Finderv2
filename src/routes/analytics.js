const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Lead = require('../models/Lead');

// Apply authentication middleware
router.use(authMiddleware);

// Get overall analytics dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get basic metrics
    const totalLeads = await Lead.countDocuments({ userId, isActive: true });
    const periodLeads = await Lead.countDocuments({
      userId,
      isActive: true,
      discoveredAt: { $gte: startDate }
    });

    // Get lead scores distribution
    const scoreDistribution = await Lead.aggregate([
      { $match: { userId, isActive: true } },
      {
        $bucket: {
          groupBy: '$leadScore',
          boundaries: [0, 20, 40, 60, 80, 100],
          default: 'Other',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    // Get status distribution
    const statusDistribution = await Lead.aggregate([
      { $match: { userId, isActive: true } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get source performance
    const sourcePerformance = await Lead.aggregate([
      { $match: { userId, isActive: true } },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
          avgScore: { $avg: '$leadScore' },
          qualifiedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Qualified'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get industry performance
    const industryPerformance = await Lead.aggregate([
      { $match: { userId, isActive: true } },
      {
        $group: {
          _id: '$industry',
          count: { $sum: 1 },
          avgScore: { $avg: '$leadScore' },
          qualifiedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Qualified'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get daily lead discovery trend
    const dailyTrend = await Lead.aggregate([
      { $match: { userId, isActive: true, discoveredAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$discoveredAt' },
            month: { $month: '$discoveredAt' },
            day: { $dayOfMonth: '$discoveredAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Calculate conversion rates
    const qualifiedLeads = await Lead.countDocuments({
      userId,
      isActive: true,
      status: 'Qualified'
    });

    const contactedLeads = await Lead.countDocuments({
      userId,
      isActive: true,
      status: { $in: ['Contacted', 'Qualified', 'Proposal', 'Negotiation'] }
    });

    res.json({
      success: true,
      analytics: {
        overview: {
          totalLeads,
          periodLeads,
          qualifiedLeads,
          contactedLeads,
          qualificationRate: totalLeads > 0 ? (qualifiedLeads / totalLeads * 100).toFixed(2) : 0,
          contactRate: totalLeads > 0 ? (contactedLeads / totalLeads * 100).toFixed(2) : 0
        },
        scoreDistribution,
        statusDistribution,
        sourcePerformance,
        industryPerformance,
        dailyTrend
      }
    });
  } catch (error) {
    console.error('Error getting analytics dashboard:', error);
    res.status(500).json({
      error: 'Failed to get analytics',
      message: error.message
    });
  }
});

// Get lead conversion funnel
router.get('/funnel', async (req, res) => {
  try {
    const userId = req.user.id;

    const funnel = await Lead.aggregate([
      { $match: { userId, isActive: true } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusOrder = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
    const orderedFunnel = statusOrder.map(status => {
      const statusData = funnel.find(f => f._id === status);
      return {
        status,
        count: statusData ? statusData.count : 0
      };
    });

    res.json({
      success: true,
      funnel: orderedFunnel
    });
  } catch (error) {
    console.error('Error getting conversion funnel:', error);
    res.status(500).json({
      error: 'Failed to get conversion funnel',
      message: error.message
    });
  }
});

// Get performance metrics
router.get('/performance', async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const matchQuery = { userId, isActive: true };
    if (startDate && endDate) {
      matchQuery.discoveredAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const performance = await Lead.aggregate([
      { $match: matchQuery },
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
          },
          contactedLeads: {
            $sum: { $cond: [{ $in: ['$status', ['Contacted', 'Qualified', 'Proposal', 'Negotiation']] }, 1, 0] }
          },
          wonLeads: {
            $sum: { $cond: [{ $eq: ['$status', 'Closed Won'] }, 1, 0] }
          }
        }
      }
    ]);

    const metrics = performance[0] || {
      totalLeads: 0,
      avgScore: 0,
      highScoreLeads: 0,
      qualifiedLeads: 0,
      contactedLeads: 0,
      wonLeads: 0
    };

    // Calculate rates
    const qualificationRate = metrics.totalLeads > 0 ? (metrics.qualifiedLeads / metrics.totalLeads * 100).toFixed(2) : 0;
    const contactRate = metrics.totalLeads > 0 ? (metrics.contactedLeads / metrics.totalLeads * 100).toFixed(2) : 0;
    const winRate = metrics.contactedLeads > 0 ? (metrics.wonLeads / metrics.contactedLeads * 100).toFixed(2) : 0;

    res.json({
      success: true,
      performance: {
        ...metrics,
        qualificationRate: parseFloat(qualificationRate),
        contactRate: parseFloat(contactRate),
        winRate: parseFloat(winRate)
      }
    });
  } catch (error) {
    console.error('Error getting performance metrics:', error);
    res.status(500).json({
      error: 'Failed to get performance metrics',
      message: error.message
    });
  }
});

module.exports = router;
