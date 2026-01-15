const Surgery = require('../models/Surgery');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient'); // Needed for email access
const OperationTheatre = require('../models/OperationTheatre');
const logger = require('../logs/logger');
const { sendSurgeryNotification } = require('../services/emailService');

// Helper to check overlap
const checkOverlap = async (otId, doctorId, startDateTime, endDateTime, excludeSurgeryId = null) => {
  const query = {
    $or: [
      // Check OT overlap
      {
        operationTheatre: otId,
        status: { $in: ['Scheduled', 'Rescheduled', 'Emergency'] },
        $or: [
          { startDateTime: { $lt: endDateTime, $gte: startDateTime } },
          { endDateTime: { $gt: startDateTime, $lte: endDateTime } },
          { startDateTime: { $lte: startDateTime }, endDateTime: { $gte: endDateTime } }
        ]
      },
      // Check Doctor overlap
      {
        doctor: doctorId,
        status: { $in: ['Scheduled', 'Rescheduled', 'Emergency'] },
        $or: [
          { startDateTime: { $lt: endDateTime, $gte: startDateTime } },
          { endDateTime: { $gt: startDateTime, $lte: endDateTime } },
          { startDateTime: { $lte: startDateTime }, endDateTime: { $gte: endDateTime } }
        ]
      }
    ]
  };

  if (excludeSurgeryId) {
    query._id = { $ne: excludeSurgeryId };
  }

  const conflictingSurgery = await Surgery.findOne(query);
  return conflictingSurgery;
};

// @desc    Schedule Surgery
// @route   POST /api/surgeries
// @access  Private/Admin
const createSurgery = async (req, res) => {
  const { patient, doctor, operationTheatre, date, startTime, endTime, anesthesiaType, anesthesiologist, nurses, priority } = req.body;
  
  try {
    // Construct Date objects
    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);

    if (startDateTime >= endDateTime) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    if (priority !== 'Emergency') {
      const conflict = await checkOverlap(operationTheatre, doctor, startDateTime, endDateTime);
      if (conflict) {
        return res.status(400).json({ message: 'Conflict detected: OT or Doctor is busy.', conflictId: conflict._id });
      }
    } else {
        logger.warn('Emergency surgery scheduled potentially conflicting.');
    }

    const surgery = new Surgery({
      patient,
      doctor,
      operationTheatre,
      date,
      startTime,
      endTime,
      startDateTime,
      endDateTime,
      anesthesiaType,
      anesthesiologist,
      nurses,
      priority: priority || 'Normal'
    });

    const createdSurgery = await surgery.save();
    
    // Fetch details for email
    const patientDetails = await Patient.findById(patient);
    const doctorDetails = await Doctor.findById(doctor);
    const otDetails = await OperationTheatre.findById(operationTheatre);

    // Send Email
    if (patientDetails && patientDetails.email) {
        sendSurgeryNotification(patientDetails.email, {
            patientName: patientDetails.name,
            doctorName: doctorDetails ? doctorDetails.name : 'Doctor',
            date,
            time: `${startTime} - ${endTime}`,
            ot: otDetails ? otDetails.name : 'OT'
        }, 'SCHEDULED');
    }

    logger.info(`Surgery scheduled: ${createdSurgery._id}`);
    res.status(201).json(createdSurgery);

  } catch (error) {
    logger.error(`Create Surgery Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get All Surgeries
// @route   GET /api/surgeries
// @access  Protected
const getSurgeries = async (req, res) => {
  try {
    let query = {};
    
    // RBAC: If role is DOCTOR, only show surgeries assigned to them
    if (req.user && req.user.role === 'DOCTOR') {
        const doctor = await Doctor.findOne({ email: req.user.email });
        if (doctor) {
            query.doctor = doctor._id;
        } else {
            // Case where user has DOCTOR role but no linked Doctor profile
            // Return empty list safely
            return res.json([]); 
        }
    }

    const surgeries = await Surgery.find(query)
      .populate('patient', 'name')
      .populate('doctor', 'name specialization')
      .populate('operationTheatre', 'name otNumber');
    res.json(surgeries);
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
    const { status, date, startTime, endTime } = req.body;
    try {
        const surgery = await Surgery.findById(req.params.id)
            .populate('patient')
            .populate('doctor'); 

        if (!surgery) return res.status(404).json({ message: 'Surgery not found' });

        // If rescheduling
        if ((date || startTime || endTime) && status !== 'Cancelled') {
             const newDate = date || surgery.date.toISOString().split('T')[0];
             const newStart = startTime || surgery.startTime;
             const newEnd = endTime || surgery.endTime;
             
             const startDateTime = new Date(`${newDate}T${newStart}:00`);
             const endDateTime = new Date(`${newDate}T${newEnd}:00`);

             const conflict = await checkOverlap(surgery.operationTheatre, surgery.doctor, startDateTime, endDateTime, surgery._id);
             if (conflict) {
                 return res.status(400).json({ message: 'Conflict detected during reschedule.' });
             }

             surgery.date = newDate;
             surgery.startTime = newStart;
             surgery.endTime = newEnd;
             surgery.startDateTime = startDateTime;
             surgery.endDateTime = endDateTime;
             surgery.status = 'Rescheduled';

             // Notify Reschedule
              if (surgery.patient && surgery.patient.email) {
                sendSurgeryNotification(surgery.patient.email, {
                    patientName: surgery.patient.name,
                    doctorName: surgery.doctor ? surgery.doctor.name : 'Doctor',
                    date: newDate,
                    time: `${newStart} - ${newEnd}`,
                }, 'RESCHEDULED');
            }
        }

        if (status) surgery.status = status;

        const updatedSurgery = await surgery.save();
        logger.info(`Surgery updated: ${updatedSurgery._id}`);
        res.json(updatedSurgery);
    } catch (error) {
        logger.error(`Update Surgery Error: ${error.message}`);
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
