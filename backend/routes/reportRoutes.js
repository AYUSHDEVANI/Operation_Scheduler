const express = require('express');
const router = express.Router();
const { createReport, getReportsBySurgery } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createReport);

router.route('/surgery/:surgeryId')
  .get(protect, getReportsBySurgery);

module.exports = router;
