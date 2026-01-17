const Report = require('../models/Report');
const logger = require('../logs/logger');
const { logAction } = require('../utils/auditLogger');

const createReport = async (req, res) => {
  const { surgery, type, title, fileUrl, notes } = req.body;
  try {
    const report = new Report({
      surgery,
      type,
      title,
      fileUrl,
      notes,
      uploadedBy: req.user._id
    });
    const createdReport = await report.save();
    await logAction('CREATE_REPORT', req, { collectionName: 'reports', id: createdReport._id, name: createdReport.title }, { type, surgery });
    res.status(201).json(createdReport);
  } catch (error) {
    logger.error(`Create Report Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getReportsBySurgery = async (req, res) => {
  try {
    const reports = await Report.find({ surgery: req.params.surgeryId });
    res.json(reports);
  } catch (error) {
    logger.error(`Get Reports Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { createReport, getReportsBySurgery };
