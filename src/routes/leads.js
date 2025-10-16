const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const authMiddleware = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Lead discovery and generation
router.post('/discover', leadController.discoverLeads);
router.post('/generate', leadController.generateLeads);

// Lead management
router.get('/', leadController.getLeads);
router.get('/:id', leadController.getLeadById);
router.put('/:id', leadController.updateLead);
router.delete('/:id', leadController.deleteLead);

// Lead scoring and analysis
router.post('/:id/score', leadController.scoreLead);
router.post('/:id/analyze', leadController.analyzeLead);

// Bulk operations
router.post('/bulk-update', leadController.bulkUpdateLeads);
router.post('/bulk-delete', leadController.bulkDeleteLeads);

// Export and import
router.get('/export/csv', leadController.exportLeadsCSV);
router.get('/export/json', leadController.exportLeadsJSON);
router.post('/import', leadController.importLeads);

// Analytics
router.get('/analytics/overview', leadController.getLeadsAnalytics);
router.get('/analytics/industry', leadController.getIndustryAnalytics);
router.get('/analytics/source', leadController.getSourceAnalytics);

module.exports = router;
