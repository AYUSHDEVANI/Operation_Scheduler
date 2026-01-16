const Surgery = require('../models/Surgery');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient'); // Needed for email access
const OperationTheatre = require('../models/OperationTheatre');
const logger = require('../logs/logger');
// checkOverlap and email logic moved to surgeryService

// @desc    Schedule Surgery
// @route   POST /api/surgeries
// @access  Private/Admin
const { createSurgeryService, updateSurgeryService } = require('../services/surgeryService');

// @desc    Schedule Surgery
// @route   POST /api/surgeries
// @access  Private/Admin
const createSurgery = async (req, res) => {
  try {
    const io = req.app.get('io');
    const newSurgery = await createSurgeryService(req.body, io);
    logger.info(`Surgery scheduled: ${newSurgery._id}`);
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
const getSurgeries = async (req, res) => {
    try {
        const { date, page = 1, limit = 100 } = req.query; // Default limit high for calendar compatibility if page not sent
        let query = {};

        // Filter by date if provided
        if (date) {
             const startDate = new Date(date);
             const endDate = new Date(date);
             endDate.setDate(endDate.getDate() + 1);
             query.startDateTime = { $gte: startDate, $lt: endDate };
        }

        // RBAC: If Doctor, view only their surgeries
        if (req.user && req.user.role === 'DOCTOR') {
             // Find Doctor Profile associated with User Email
             const User = require('../models/User'); // Lazy load to avoid circular dependency if any
             const Doctor = require('../models/Doctor');
             
             // Assuming req.user.email is available from auth middleware
            const doctorProfile = await Doctor.findOne({ email: req.user.email });
             if (doctorProfile) {
                 query.doctor = doctorProfile._id;
             } else {
                 // If no profile linked, maybe return empty or all? strict: return empty
                 return res.json([]); 
             }
        }
        
        // Count for pagination
        const count = await Surgery.countDocuments(query);

        const surgeries = await Surgery.find(query)
            .populate('patient')
            .populate('doctor')
            .populate('operationTheatre')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ startDateTime: 1 }); // Sort by time

        res.json({
            surgeries,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            totalSurgeries: count
        });

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
// @desc    Update/Reschedule Surgery
// @route   PUT /api/surgeries/:id
// @access  Private/Admin
const updateSurgery = async (req, res) => {
    try {
        const io = req.app.get('io');
    const updatedSurgery = await updateSurgeryService(req.params.id, req.body, io);
    logger.info(`Surgery updated: ${updatedSurgery._id}`);
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
}


const deleteSurgery = async (req, res) => {
  try {
    const surgery = await Surgery.findById(req.params.id)
        .populate('patient')
        .populate('doctor');

    if (surgery) {
       // Notify Cancellation before deleting (or just soft cancel by status, but this fn is DELETE)
       // Usually we set status to Cancelled instead of deleting, but if user specifically calls DELETE:
       if (surgery.patient && surgery.patient.email) {
            sendSurgeryNotification(surgery.patient.email, {
                patientName: surgery.patient.name,
                doctorName: surgery.doctor ? surgery.doctor.name : 'Doctor',
                date: surgery.date.toISOString().split('T')[0],
            }, 'CANCELLED');
        }

      await surgery.deleteOne();
      logger.info(`Surgery cancelled: ${req.params.id}`);
      res.json({ message: 'Surgery cancelled' });
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
    const totalSurgeries = await Surgery.countDocuments();
    const completed = await Surgery.countDocuments({ status: 'Completed' });
    const cancelled = await Surgery.countDocuments({ status: 'Cancelled' });
    const scheduled = await Surgery.countDocuments({ status: 'Scheduled' });
    const emergency = await Surgery.countDocuments({ priority: 'Emergency' });

    res.json({
      total: totalSurgeries,
      completed,
      cancelled,
      scheduled,
      emergency
    });
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
