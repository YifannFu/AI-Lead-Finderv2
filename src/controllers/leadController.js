const Lead = require('../models/Lead');
const User = require('../models/User');
const leadDiscoveryService = require('../services/leadDiscoveryService');
const aiService = require('../services/aiService');
const csvWriter = require('csv-writer');
const fs = require('fs');
const path = require('path');

class LeadController {
  /**
   * Discover leads based on search parameters
   */
  async discoverLeads(req, res) {
    try {
      const userId = req.user.id;
      const searchParams = req.body;

      // Check if user can generate more leads
      const user = await User.findById(userId);
      if (!user.canGenerateLeads()) {
        return res.status(429).json({
          error: 'Lead generation limit reached',
          message: 'You have reached your monthly lead generation limit. Please upgrade your plan.'
        });
      }

      // Validate search parameters
      if (!searchParams.industry || !searchParams.sources) {
        return res.status(400).json({
          error: 'Missing required parameters',
          message: 'Industry and sources are required'
        });
      }

      // Discover leads
      const leads = await leadDiscoveryService.discoverLeads(searchParams, userId);

      // Save leads to database
      const savedLeads = [];
      for (const leadData of leads) {
        try {
          const lead = new Lead({
            ...leadData,
            userId
          });
          await lead.save();
          savedLeads.push(lead);
        } catch (error) {
          console.error('Error saving lead:', error);
        }
      }

      // Update user usage
      await user.incrementUsage('leads');

      // Emit real-time update
      const io = req.app.get('io');
      io.to(`user-${userId}`).emit('leads-discovered', {
        count: savedLeads.length,
        leads: savedLeads
      });

      res.json({
        success: true,
        message: `Discovered ${savedLeads.length} leads`,
        leads: savedLeads,
        total: savedLeads.length
      });
    } catch (error) {
      console.error('Error discovering leads:', error);
      res.status(500).json({
        error: 'Failed to discover leads',
        message: error.message
      });
    }
  }

  /**
   * Generate leads using AI
   */
  async generateLeads(req, res) {
    try {
      const userId = req.user.id;
      const { industry, keywords, count = 10 } = req.body;

      const user = await User.findById(userId);
      if (!user.canGenerateLeads()) {
        return res.status(429).json({
          error: 'Lead generation limit reached'
        });
      }

      // Generate leads using AI
      const generatedLeads = [];
      for (let i = 0; i < count; i++) {
        const leadData = await this.generateSingleLead(industry, keywords);
        if (leadData) {
          const lead = new Lead({
            ...leadData,
            userId,
            source: 'AI Generated'
          });
          await lead.save();
          generatedLeads.push(lead);
        }
      }

      await user.incrementUsage('leads');

      res.json({
        success: true,
        message: `Generated ${generatedLeads.length} leads`,
        leads: generatedLeads
      });
    } catch (error) {
      console.error('Error generating leads:', error);
      res.status(500).json({
        error: 'Failed to generate leads',
        message: error.message
      });
    }
  }

  /**
   * Get leads with filtering and pagination
   */
  async getLeads(req, res) {
    try {
      const userId = req.user.id;
      const {
        page = 1,
        limit = 20,
        industry,
        status,
        priority,
        minScore,
        maxScore,
        source,
        search
      } = req.query;

      const filter = { userId, isActive: true };

      // Apply filters
      if (industry) filter.industry = industry;
      if (status) filter.status = status;
      if (priority) filter.priority = priority;
      if (source) filter.source = source;
      if (minScore || maxScore) {
        filter.leadScore = {};
        if (minScore) filter.leadScore.$gte = parseInt(minScore);
        if (maxScore) filter.leadScore.$lte = parseInt(maxScore);
      }
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      const leads = await Lead.find(filter)
        .sort({ leadScore: -1, discoveredAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('userId', 'firstName lastName company');

      const total = await Lead.countDocuments(filter);

      res.json({
        success: true,
        leads,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error getting leads:', error);
      res.status(500).json({
        error: 'Failed to get leads',
        message: error.message
      });
    }
  }

  /**
   * Get single lead by ID
   */
  async getLeadById(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const lead = await Lead.findOne({ _id: id, userId });
      if (!lead) {
        return res.status(404).json({
          error: 'Lead not found'
        });
      }

      res.json({
        success: true,
        lead
      });
    } catch (error) {
      console.error('Error getting lead:', error);
      res.status(500).json({
        error: 'Failed to get lead',
        message: error.message
      });
    }
  }

  /**
   * Update lead
   */
  async updateLead(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const updateData = req.body;

      const lead = await Lead.findOneAndUpdate(
        { _id: id, userId },
        { ...updateData, lastUpdated: new Date() },
        { new: true, runValidators: true }
      );

      if (!lead) {
        return res.status(404).json({
          error: 'Lead not found'
        });
      }

      res.json({
        success: true,
        message: 'Lead updated successfully',
        lead
      });
    } catch (error) {
      console.error('Error updating lead:', error);
      res.status(500).json({
        error: 'Failed to update lead',
        message: error.message
      });
    }
  }

  /**
   * Delete lead
   */
  async deleteLead(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const lead = await Lead.findOneAndUpdate(
        { _id: id, userId },
        { isActive: false },
        { new: true }
      );

      if (!lead) {
        return res.status(404).json({
          error: 'Lead not found'
        });
      }

      res.json({
        success: true,
        message: 'Lead deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting lead:', error);
      res.status(500).json({
        error: 'Failed to delete lead',
        message: error.message
      });
    }
  }

  /**
   * Score a lead using AI
   */
  async scoreLead(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const lead = await Lead.findOne({ _id: id, userId });
      if (!lead) {
        return res.status(404).json({
          error: 'Lead not found'
        });
      }

      // Re-analyze and score the lead
      const aiAnalysis = await aiService.analyzeLead(lead);
      const scoringFactors = await aiService.generateScoringFactors(lead);

      lead.aiAnalysis = aiAnalysis;
      lead.scoreFactors = scoringFactors.factors;
      lead.calculateScore();
      await lead.save();

      res.json({
        success: true,
        message: 'Lead scored successfully',
        lead
      });
    } catch (error) {
      console.error('Error scoring lead:', error);
      res.status(500).json({
        error: 'Failed to score lead',
        message: error.message
      });
    }
  }

  /**
   * Analyze lead with AI
   */
  async analyzeLead(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const lead = await Lead.findOne({ _id: id, userId });
      if (!lead) {
        return res.status(404).json({
          error: 'Lead not found'
        });
      }

      const analysis = await aiService.analyzeLead(lead);
      const outreachMessage = await aiService.generateOutreachMessage(lead, req.user);

      res.json({
        success: true,
        analysis,
        outreachMessage
      });
    } catch (error) {
      console.error('Error analyzing lead:', error);
      res.status(500).json({
        error: 'Failed to analyze lead',
        message: error.message
      });
    }
  }

  /**
   * Bulk update leads
   */
  async bulkUpdateLeads(req, res) {
    try {
      const userId = req.user.id;
      const { leadIds, updateData } = req.body;

      const result = await Lead.updateMany(
        { _id: { $in: leadIds }, userId },
        { ...updateData, lastUpdated: new Date() }
      );

      res.json({
        success: true,
        message: `Updated ${result.modifiedCount} leads`,
        modifiedCount: result.modifiedCount
      });
    } catch (error) {
      console.error('Error bulk updating leads:', error);
      res.status(500).json({
        error: 'Failed to bulk update leads',
        message: error.message
      });
    }
  }

  /**
   * Bulk delete leads
   */
  async bulkDeleteLeads(req, res) {
    try {
      const userId = req.user.id;
      const { leadIds } = req.body;

      const result = await Lead.updateMany(
        { _id: { $in: leadIds }, userId },
        { isActive: false, lastUpdated: new Date() }
      );

      res.json({
        success: true,
        message: `Deleted ${result.modifiedCount} leads`,
        modifiedCount: result.modifiedCount
      });
    } catch (error) {
      console.error('Error bulk deleting leads:', error);
      res.status(500).json({
        error: 'Failed to bulk delete leads',
        message: error.message
      });
    }
  }

  /**
   * Export leads to CSV
   */
  async exportLeadsCSV(req, res) {
    try {
      const userId = req.user.id;
      const { industry, status, source } = req.query;

      const filter = { userId, isActive: true };
      if (industry) filter.industry = industry;
      if (status) filter.status = status;
      if (source) filter.source = source;

      const leads = await Lead.find(filter).sort({ leadScore: -1 });

      const csvData = leads.map(lead => ({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        jobTitle: lead.jobTitle,
        industry: lead.industry,
        companySize: lead.companySize,
        leadScore: lead.leadScore,
        status: lead.status,
        priority: lead.priority,
        source: lead.source,
        discoveredAt: lead.discoveredAt
      }));

      const filename = `leads-export-${Date.now()}.csv`;
      const filepath = path.join(__dirname, '../../temp', filename);

      // Ensure temp directory exists
      const tempDir = path.dirname(filepath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const writer = csvWriter.createObjectCsvWriter({
        path: filepath,
        header: [
          { id: 'name', title: 'Name' },
          { id: 'email', title: 'Email' },
          { id: 'phone', title: 'Phone' },
          { id: 'company', title: 'Company' },
          { id: 'jobTitle', title: 'Job Title' },
          { id: 'industry', title: 'Industry' },
          { id: 'companySize', title: 'Company Size' },
          { id: 'leadScore', title: 'Lead Score' },
          { id: 'status', title: 'Status' },
          { id: 'priority', title: 'Priority' },
          { id: 'source', title: 'Source' },
          { id: 'discoveredAt', title: 'Discovered At' }
        ]
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
      console.error('Error exporting leads:', error);
      res.status(500).json({
        error: 'Failed to export leads',
        message: error.message
      });
    }
  }

  /**
   * Export leads to JSON
   */
  async exportLeadsJSON(req, res) {
    try {
      const userId = req.user.id;
      const { industry, status, source } = req.query;

      const filter = { userId, isActive: true };
      if (industry) filter.industry = industry;
      if (status) filter.status = status;
      if (source) filter.source = source;

      const leads = await Lead.find(filter).sort({ leadScore: -1 });

      const filename = `leads-export-${Date.now()}.json`;
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.json(leads);
    } catch (error) {
      console.error('Error exporting leads:', error);
      res.status(500).json({
        error: 'Failed to export leads',
        message: error.message
      });
    }
  }

  /**
   * Import leads from file
   */
  async importLeads(req, res) {
    try {
      const userId = req.user.id;
      const { leads } = req.body;

      if (!Array.isArray(leads)) {
        return res.status(400).json({
          error: 'Invalid data format',
          message: 'Leads must be an array'
        });
      }

      const user = await User.findById(userId);
      if (!user.canGenerateLeads()) {
        return res.status(429).json({
          error: 'Lead import limit reached'
        });
      }

      const importedLeads = [];
      for (const leadData of leads) {
        try {
          const lead = new Lead({
            ...leadData,
            userId,
            source: leadData.source || 'Import'
          });
          await lead.save();
          importedLeads.push(lead);
        } catch (error) {
          console.error('Error importing lead:', error);
        }
      }

      await user.incrementUsage('leads');

      res.json({
        success: true,
        message: `Imported ${importedLeads.length} leads`,
        leads: importedLeads
      });
    } catch (error) {
      console.error('Error importing leads:', error);
      res.status(500).json({
        error: 'Failed to import leads',
        message: error.message
      });
    }
  }

  /**
   * Get leads analytics overview
   */
  async getLeadsAnalytics(req, res) {
    try {
      const userId = req.user.id;

      const totalLeads = await Lead.countDocuments({ userId, isActive: true });
      const highScoreLeads = await Lead.countDocuments({ userId, isActive: true, leadScore: { $gte: 80 } });
      const qualifiedLeads = await Lead.countDocuments({ userId, isActive: true, status: 'Qualified' });
      const contactedLeads = await Lead.countDocuments({ userId, isActive: true, status: { $in: ['Contacted', 'Qualified', 'Proposal', 'Negotiation'] } });

      const avgScore = await Lead.aggregate([
        { $match: { userId: userId, isActive: true } },
        { $group: { _id: null, avgScore: { $avg: '$leadScore' } } }
      ]);

      res.json({
        success: true,
        analytics: {
          totalLeads,
          highScoreLeads,
          qualifiedLeads,
          contactedLeads,
          averageScore: avgScore[0]?.avgScore || 0,
          conversionRate: totalLeads > 0 ? (contactedLeads / totalLeads * 100).toFixed(2) : 0
        }
      });
    } catch (error) {
      console.error('Error getting leads analytics:', error);
      res.status(500).json({
        error: 'Failed to get analytics',
        message: error.message
      });
    }
  }

  /**
   * Get industry analytics
   */
  async getIndustryAnalytics(req, res) {
    try {
      const userId = req.user.id;

      const industryStats = await Lead.aggregate([
        { $match: { userId: userId, isActive: true } },
        {
          $group: {
            _id: '$industry',
            count: { $sum: 1 },
            avgScore: { $avg: '$leadScore' },
            highScoreCount: {
              $sum: { $cond: [{ $gte: ['$leadScore', 80] }, 1, 0] }
            }
          }
        },
        { $sort: { count: -1 } }
      ]);

      res.json({
        success: true,
        industryAnalytics: industryStats
      });
    } catch (error) {
      console.error('Error getting industry analytics:', error);
      res.status(500).json({
        error: 'Failed to get industry analytics',
        message: error.message
      });
    }
  }

  /**
   * Get source analytics
   */
  async getSourceAnalytics(req, res) {
    try {
      const userId = req.user.id;

      const sourceStats = await Lead.aggregate([
        { $match: { userId: userId, isActive: true } },
        {
          $group: {
            _id: '$source',
            count: { $sum: 1 },
            avgScore: { $avg: '$leadScore' },
            conversionRate: {
              $avg: {
                $cond: [
                  { $in: ['$status', ['Contacted', 'Qualified', 'Proposal', 'Negotiation']] },
                  1,
                  0
                ]
              }
            }
          }
        },
        { $sort: { count: -1 } }
      ]);

      res.json({
        success: true,
        sourceAnalytics: sourceStats
      });
    } catch (error) {
      console.error('Error getting source analytics:', error);
      res.status(500).json({
        error: 'Failed to get source analytics',
        message: error.message
      });
    }
  }

  /**
   * Generate a single lead using AI
   */
  async generateSingleLead(industry, keywords) {
    try {
      // This is a simplified version - in reality, you'd use more sophisticated AI
      const companies = [
        'TechCorp', 'InnovateLabs', 'DataFlow', 'CloudTech', 'AI Solutions',
        'Digital Dynamics', 'Future Systems', 'Smart Analytics', 'NextGen Corp'
      ];
      
      const names = [
        'John Smith', 'Sarah Johnson', 'Mike Chen', 'Emily Davis', 'David Wilson',
        'Lisa Anderson', 'Robert Brown', 'Jennifer Taylor', 'Michael Garcia'
      ];
      
      const titles = [
        'CEO', 'CTO', 'VP of Engineering', 'Head of Product', 'Director of Sales',
        'Marketing Manager', 'Business Development Lead', 'Operations Director'
      ];

      const randomCompany = companies[Math.floor(Math.random() * companies.length)];
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomTitle = titles[Math.floor(Math.random() * titles.length)];

      return {
        name: randomName,
        email: `${randomName.toLowerCase().replace(' ', '.')}@${randomCompany.toLowerCase()}.com`,
        company: randomCompany,
        jobTitle: randomTitle,
        industry: industry,
        companySize: '51-200',
        source: 'AI Generated',
        aiAnalysis: {
          intent: 'Medium',
          painPoints: ['Scalability', 'Cost optimization'],
          budget: 'Medium',
          timeline: '3-6 months',
          decisionMaker: true,
          sentiment: 'Positive'
        }
      };
    } catch (error) {
      console.error('Error generating single lead:', error);
      return null;
    }
  }
}

module.exports = new LeadController();
