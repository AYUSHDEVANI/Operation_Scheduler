const SurgeryTracking = require('../models/SurgeryTracking');
const logger = require('../logs/logger');

// @desc    Get tracking info for a surgery
// @route   GET /api/surgery-tracking/:surgeryId
// @access  Protected
const getTrackingBySurgeryId = async (req, res) => {
  try {
    const tracking = await SurgeryTracking.findOne({ surgery: req.params.surgeryId });
    if (tracking) {
      res.json(tracking);
    } else {
      // Return empty default structure if not found, or 404. 
      // For UI simplicity, returning null is fine, or 404 handled by frontend.
      res.status(404).json({ message: 'Tracking info not found' });
    }
  } catch (error) {
    logger.error(`Get Tracking Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create or Update tracking info
// @route   POST /api/surgery-tracking
// @access  Protected (Surgeon/Nurse/Admin)
const updateTracking = async (req, res) => {
  const { surgeryId, preOpChecklist, postOpNotes, complications, recoveryStatus, nurseInCharge } = req.body;

  try {
    let tracking = await SurgeryTracking.findOne({ surgery: surgeryId });

    if (tracking) {
      // Update existing
      if (preOpChecklist) tracking.preOpChecklist = { ...tracking.preOpChecklist, ...JSON.parse(preOpChecklist) }; // parsing needed for FormData
      if (postOpNotes) tracking.postOpNotes = postOpNotes;
      if (complications) tracking.complications = complications;
      if (recoveryStatus) tracking.recoveryStatus = recoveryStatus;
      if (nurseInCharge) tracking.nurseInCharge = nurseInCharge;
      
      // Handle File
      if (req.file) {
          tracking.attachments.push({
              fileName: req.file.filename,
              filePath: req.file.path,
              fileType: req.file.mimetype
          });
      }

      const updatedTracking = await tracking.save();
      logger.info(`Tracking updated for surgery: ${surgeryId}`);
      res.json(updatedTracking);
    } else {
      // Create new
      const newTrackingData = {
        surgery: surgeryId,
        preOpChecklist: preOpChecklist ? JSON.parse(preOpChecklist) : undefined,
        postOpNotes,
        complications,
        recoveryStatus,
        nurseInCharge,
        attachments: []
      };

      if (req.file) {
          newTrackingData.attachments = [{
              fileName: req.file.filename,
              filePath: req.file.path,
              fileType: req.file.mimetype
          }];
      }

      tracking = new SurgeryTracking(newTrackingData);
      const createdTracking = await tracking.save();
      logger.info(`Tracking created for surgery: ${surgeryId}`);
      res.status(201).json(createdTracking);
    }
  } catch (error) {
    logger.error(`Update Tracking Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getTrackingBySurgeryId,
  updateTracking
};
