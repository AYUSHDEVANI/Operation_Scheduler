const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditController');
const { protect, superAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, superAdmin, getAuditLogs);

module.exports = router;
