const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Lead = require('../models/Lead');
const csvWriter = require('csv-writer');
const fs = require('fs');
const path = require('path');

// Apply authentication middleware
router.use(authMiddleware);

// Export leads to CSV with advanced filtering
router.get('/leads/csv', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      industry,
      status,
      priority,
      source,
      minScore,
      maxScore,
      startDate,
      endDate,
      fields = 'all'
    } = req.query;

    // Build filter
    const filter = { userId, isActive: true };
    if (industry) filter.industry = industry;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (source) filter.source = source;
    if (minScore || maxScore) {
      filter.leadScore = {};
      if (minScore) filter.leadScore.$gte = parseInt(minScore);
      if (maxScore) filter.leadScore.$lte = parseInt(maxScore);
    }
    if (startDate && endDate) {
      filter.discoveredAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const leads = await Lead.find(filter).sort({ leadScore: -1, discoveredAt: -1 });

    // Define CSV headers based on requested fields
    let headers = [];
    if (fields === 'all') {
      headers = [
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'phone', title: 'Phone' },
        { id: 'company', title: 'Company' },
        { id: 'jobTitle', title: 'Job Title' },
        { id: 'industry', title: 'Industry' },
        { id: 'subIndustry', title: 'Sub Industry' },
        { id: 'companySize', title: 'Company Size' },
        { id: 'companyRevenue', title: 'Company Revenue' },
        { id: 'companyWebsite', title: 'Company Website' },
        { id: 'leadScore', title: 'Lead Score' },
        { id: 'status', title: 'Status' },
        { id: 'priority', title: 'Priority' },
        { id: 'source', title: 'Source' },
        { id: 'sourceUrl', title: 'Source URL' },
        { id: 'discoveredAt', title: 'Discovered At' },
        { id: 'lastUpdated', title: 'Last Updated' },
        { id: 'tags', title: 'Tags' }
      ];
    } else {
      const requestedFields = fields.split(',');
      const allHeaders = [
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'phone', title: 'Phone' },
        { id: 'company', title: 'Company' },
        { id: 'jobTitle', title: 'Job Title' },
        { id: 'industry', title: 'Industry' },
        { id: 'subIndustry', title: 'Sub Industry' },
        { id: 'companySize', title: 'Company Size' },
        { id: 'companyRevenue', title: 'Company Revenue' },
        { id: 'companyWebsite', title: 'Company Website' },
        { id: 'leadScore', title: 'Lead Score' },
        { id: 'status', title: 'Status' },
        { id: 'priority', title: 'Priority' },
        { id: 'source', title: 'Source' },
        { id: 'sourceUrl', title: 'Source URL' },
        { id: 'discoveredAt', title: 'Discovered At' },
        { id: 'lastUpdated', title: 'Last Updated' },
        { id: 'tags', title: 'Tags' }
      ];
      headers = allHeaders.filter(header => requestedFields.includes(header.id));
    }

    // Prepare CSV data
    const csvData = leads.map(lead => {
      const data = {};
      headers.forEach(header => {
        if (header.id === 'tags') {
          data[header.id] = lead.tags ? lead.tags.join('; ') : '';
        } else if (header.id === 'discoveredAt' || header.id === 'lastUpdated') {
          data[header.id] = lead[header.id] ? lead[header.id].toISOString().split('T')[0] : '';
        } else {
          data[header.id] = lead[header.id] || '';
        }
      });
      return data;
    });

    const filename = `leads-export-${Date.now()}.csv`;
    const filepath = path.join(__dirname, '../../temp', filename);

    // Ensure temp directory exists
    const tempDir = path.dirname(filepath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const writer = csvWriter.createObjectCsvWriter({
      path: filepath,
      header: headers
    });

    await writer.writeRecords(csvData);

    res.download(filepath, filename, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
      // Clean up file after download
      fs.unlink(filepath, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting temp file:', unlinkErr);
      });
    });
  } catch (error) {
    console.error('Error exporting leads to CSV:', error);
    res.status(500).json({
      error: 'Failed to export leads',
      message: error.message
    });
  }
});

// Export leads to JSON
router.get('/leads/json', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      industry,
      status,
      priority,
      source,
      minScore,
      maxScore,
      startDate,
      endDate
    } = req.query;

    // Build filter
    const filter = { userId, isActive: true };
    if (industry) filter.industry = industry;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (source) filter.source = source;
    if (minScore || maxScore) {
      filter.leadScore = {};
      if (minScore) filter.leadScore.$gte = parseInt(minScore);
      if (maxScore) filter.leadScore.$lte = parseInt(maxScore);
    }
    if (startDate && endDate) {
      filter.discoveredAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const leads = await Lead.find(filter).sort({ leadScore: -1, discoveredAt: -1 });

    const filename = `leads-export-${Date.now()}.json`;
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.json({
      exportDate: new Date().toISOString(),
      totalLeads: leads.length,
      filters: req.query,
      leads
    });
  } catch (error) {
    console.error('Error exporting leads to JSON:', error);
    res.status(500).json({
      error: 'Failed to export leads',
      message: error.message
    });
  }
});

// Export analytics report
router.get('/analytics/report', async (req, res) => {
  try {
    const userId = req.user.id;
    const { format = 'json', period = '30d' } = req.query;

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

    // Get analytics data
    const totalLeads = await Lead.countDocuments({ userId, isActive: true });
    const periodLeads = await Lead.countDocuments({
      userId,
      isActive: true,
      discoveredAt: { $gte: startDate }
    });

    const industryStats = await Lead.aggregate([
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
      { $sort: { count: -1 } }
    ]);

    const sourceStats = await Lead.aggregate([
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

    const report = {
      reportDate: new Date().toISOString(),
      period,
      startDate,
      endDate: now,
      summary: {
        totalLeads,
        periodLeads,
        industryBreakdown: industryStats,
        sourceBreakdown: sourceStats
      }
    };

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = [
        ['Metric', 'Value'],
        ['Total Leads', totalLeads],
        ['Period Leads', periodLeads],
        ['', ''],
        ['Industry', 'Count', 'Avg Score', 'Qualified'],
        ...industryStats.map(stat => [stat._id, stat.count, stat.avgScore.toFixed(2), stat.qualifiedCount]),
        ['', ''],
        ['Source', 'Count', 'Avg Score', 'Qualified'],
        ...sourceStats.map(stat => [stat._id, stat.count, stat.avgScore.toFixed(2), stat.qualifiedCount])
      ];

      const filename = `analytics-report-${Date.now()}.csv`;
      const filepath = path.join(__dirname, '../../temp', filename);

      // Ensure temp directory exists
      const tempDir = path.dirname(filepath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      fs.writeFileSync(filepath, csvContent);

      res.download(filepath, filename, (err) => {
        if (err) {
          console.error('Error downloading file:', err);
        }
        // Clean up file after download
        fs.unlink(filepath, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting temp file:', unlinkErr);
        });
      });
    } else {
      // Return JSON
      const filename = `analytics-report-${Date.now()}.json`;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.json(report);
    }
  } catch (error) {
    console.error('Error exporting analytics report:', error);
    res.status(500).json({
      error: 'Failed to export analytics report',
      message: error.message
    });
  }
});

module.exports = router;
