const Surgery = require('../models/Surgery');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const OperationTheatre = require('../models/OperationTheatre');
// const { sendSurgeryNotification } = require('./emailService'); // Replaced by Queue
const emailQueue = require('./emailQueue');
const logger = require('../logs/logger');

/**
 * Check for overlapping surgeries
 * @param {string} otId - Operation Theatre ID
 * @param {string} doctorId - Doctor ID
 * @param {Date} startDateTime - Start time
 * @param {Date} endDateTime - End time
 * @param {string} excludeSurgeryId - ID to exclude (for updates)
 * @returns {Promise<Object|null>} - Conflicting surgery or null
 */
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

/**
 * optimize: Create a new surgery
 */
const createSurgeryService = async (data, io) => {
  const { patient, doctor, operationTheatre, date, startTime, endTime, anesthesiaType, anesthesiologist, nurses, priority } = data;

  const startDateTime = new Date(`${date}T${startTime}:00`);
  const endDateTime = new Date(`${date}T${endTime}:00`);

  if (startDateTime >= endDateTime) {
    throw new Error('End time must be after start time');
  }

  if (priority !== 'Emergency') {
    const conflict = await checkOverlap(operationTheatre, doctor, startDateTime, endDateTime);
    if (conflict) {
      throw new Error(`Conflict detected: OT or Doctor is busy. Conflict ID: ${conflict._id}`);
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

  // Send Notification via Background Queue
  const patientDetails = await Patient.findById(patient);
  const doctorDetails = await Doctor.findById(doctor);
  const otDetails = await OperationTheatre.findById(operationTheatre);

  if (patientDetails && patientDetails.email) {
    emailQueue.add(patientDetails.email, {
      patientName: patientDetails.name,
      doctorName: doctorDetails ? doctorDetails.name : 'Doctor',
      date,
      time: `${startTime} - ${endTime}`,
      ot: otDetails ? otDetails.name : 'OT'
    }, 'SCHEDULED');
  }

  // Real-time Update
  if (io) {
    io.emit('surgery_updated', { action: 'create', surgery: createdSurgery });
  }

  return createdSurgery;
};

/**
 * Update/Reschedule a surgery
 */
const updateSurgeryService = async (id, data, io) => {
  const { status, date, startTime, endTime } = data;
  
  const surgery = await Surgery.findById(id)
      .populate('patient')
      .populate('doctor'); 

  if (!surgery) throw new Error('Surgery not found');

  // If rescheduling
  if ((date || startTime || endTime) && status !== 'Cancelled') {
       const newDate = date || surgery.date.toISOString().split('T')[0];
       const newStart = startTime || surgery.startTime;
       const newEnd = endTime || surgery.endTime;
       
       const startDateTime = new Date(`${newDate}T${newStart}:00`);
       const endDateTime = new Date(`${newDate}T${newEnd}:00`);

       const conflict = await checkOverlap(surgery.operationTheatre, surgery.doctor, startDateTime, endDateTime, surgery._id);
       if (conflict) {
           throw new Error('Conflict detected during reschedule.');
       }

       surgery.date = newDate;
       surgery.startTime = newStart;
       surgery.endTime = newEnd;
       surgery.startDateTime = startDateTime;
       surgery.endDateTime = endDateTime;
       surgery.status = 'Rescheduled';

       // Notify Reschedule via Queue
        if (surgery.patient && surgery.patient.email) {
          emailQueue.add(surgery.patient.email, {
              patientName: surgery.patient.name,
              doctorName: surgery.doctor ? surgery.doctor.name : 'Doctor',
              date: newDate,
              time: `${newStart} - ${newEnd}`,
          }, 'RESCHEDULED');
      }
  }

  if (status) surgery.status = status;

  const updatedSurgery = await surgery.save();

  // Real-time Update
  if (io) {
    io.emit('surgery_updated', { action: 'update', surgery: updatedSurgery });
  }

  return updatedSurgery;
};

module.exports = {
  checkOverlap,
  createSurgeryService,
  updateSurgeryService
};
