const Surgery = require('../models/Surgery');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient'); // Needed for email access
const OperationTheatre = require('../models/OperationTheatre');
const logger = require('../logs/logger');
const { logAction } = require('../utils/auditLogger');
// checkOverlap and email logic moved to surgeryService

// @desc    Schedule Surgery
// @route   POST /api/surgeries
// @access  Private/Admin
const surgeryService = require('../services/surgeryService');
const { createSurgeryService, updateSurgeryService } = surgeryService;

// @desc    Schedule Surgery
// @route   POST /api/surgeries
// @access  Private/Admin
const createSurgery = async (req, res) => {
  try {
    const io = req.app.get('io');
    const newSurgery = await createSurgeryService(req.body, io);
    logger.info(`Surgery scheduled: ${newSurgery._id}`);
    await logAction('CREATE_SURGERY', req, { collectionName: 'surgeries', id: newSurgery._id, name: `Surgery` }, { ...req.body });
    res.status(201).json(newSurgery);
  } catch (error) {
    logger.error(`Create Surgery Error: ${error.message}`);
    if (error.message.includes('Conflict') || error.message.includes('End time')) {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get All Surgeries
// @route   GET /api/surgeries
// @access  Protected
// @desc    Get All Surgeries
// @route   GET /api/surgeries
// @access  Protected
const getSurgeries = async (req, res) => {
    try {
        const { date, page = 1, limit = 100 } = req.query; 
        let query = { isDeleted: false }; // Ensure soft deleted are hidden

        // Filter by date
        if (date) {
             const startDate = new Date(date);
             const endDate = new Date(date);
             endDate.setDate(endDate.getDate() + 1);
             query.startDateTime = { $gte: startDate, $lt: endDate };
        }

        // RBAC: If Doctor, view only their surgeries
        if (req.user && req.user.role === 'DOCTOR') {
             const Doctor = require('../models/Doctor');
             const doctorProfile = await Doctor.findOne({ email: req.user.email });
             if (doctorProfile) {
                 query.doctor = doctorProfile._id;
             } else {
                 return res.json([]); 
             }
        }
        
        const result = await surgeryService.getAllSurgeriesService(query, page, limit);
        res.json(result);

    } catch (error) {
        logger.error(`Get Surgeries Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Surgery by ID
// @route   GET /api/surgeries/:id
// @access  Protected
const getSurgeryById = async (req, res) => {
  try {
    const surgery = await Surgery.findById(req.params.id)
      .populate('patient')
      .populate('doctor')
      .populate('operationTheatre');
    if (surgery) {
      res.json(surgery);
    } else {
      res.status(404).json({ message: 'Surgery not found' });
    }
  } catch (error) {
    logger.error(`Get Surgery Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update/Reschedule Surgery
// @route   PUT /api/surgeries/:id
// @access  Private/Admin
const updateSurgery = async (req, res) => {
    try {
        const io = req.app.get('io');
        const updatedSurgery = await updateSurgeryService(req.params.id, req.body, io);
        logger.info(`Surgery updated: ${updatedSurgery._id}`);
        await logAction('UPDATE_SURGERY', req, { collectionName: 'surgeries', id: updatedSurgery._id, name: 'Surgery' }, { ...req.body });
        res.json(updatedSurgery);
    } catch (error) {
        logger.error(`Update Surgery Error: ${error.message}`);
        if (error.message === 'Surgery not found') {
            return res.status(404).json({ message: 'Surgery not found' });
        }
        if (error.message.includes('Conflict')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Soft Delete Surgery
// @route   DELETE /api/surgeries/:id
// @access  Private/Admin
const deleteSurgery = async (req, res) => {
  try {
    const surgery = await Surgery.findById(req.params.id);

    if (surgery) {
      // Soft Delete
      surgery.isDeleted = true;
      surgery.status = 'Cancelled'; // Auto cancel
      await surgery.save();

      logger.info(`Surgery soft deleted: ${req.params.id}`);
      await logAction('DELETE_SURGERY', req, { collectionName: 'surgeries', id: req.params.id, name: 'Surgery' });
      res.json({ message: 'Surgery removed' });
    } else {
      res.status(404).json({ message: 'Surgery not found' });
    }
  } catch (error) {
    logger.error(`Delete Surgery Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get Surgery Statistics (Count by Status)
// @route   GET /api/surgeries/stats
// @access  Protected
const getSurgeryStats = async (req, res) => {
  try {
    const stats = await surgeryService.getSurgeryStatsService();
    res.json(stats);
  } catch (error) {
    logger.error(`Get Surgery Stats Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getSurgeries,
  getSurgeryById,
  createSurgery,
  updateSurgery,
  deleteSurgery,
  getSurgeryStats
};
