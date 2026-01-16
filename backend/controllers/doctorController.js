const Doctor = require('../models/Doctor');
const logger = require('../logs/logger');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public (or Protected) - Let's make it Protected
const getDoctors = async (req, res) => {
  try {
     const { page = 1, limit = 10 } = req.query;
     const count = await Doctor.countDocuments({});
     const doctors = await Doctor.find({})
      .limit(limit * 1)
      .skip((page - 1) * limit);
      
    res.json({
        doctors,
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
        totalDoctors: count
    });
  } catch (error) {
    logger.error(`Get Doctors Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Protected
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (doctor) {
      res.json(doctor);
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (error) {
    logger.error(`Get Doctor Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a doctor
// @route   POST /api/doctors
// @access  Private/Admin
const createDoctor = async (req, res) => {
  const { name, specialization, department, contactNumber, email } = req.body;
  try {
    const doctor = new Doctor({
      name,
      specialization,
      department,
      contactNumber,
      email,
    });

    const createdDoctor = await doctor.save();
    logger.info(`Doctor created: ${createdDoctor.name}`);
    res.status(201).json(createdDoctor);
  } catch (error) {
    logger.error(`Create Doctor Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a doctor
// @route   PUT /api/doctors/:id
// @access  Private/Admin
const updateDoctor = async (req, res) => {
  const { name, specialization, availability, department, contactNumber, email } = req.body;
  
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (doctor) {
      doctor.name = name || doctor.name;
      doctor.specialization = specialization || doctor.specialization;
      doctor.availability = availability !== undefined ? availability : doctor.availability;
      doctor.department = department || doctor.department;
      doctor.contactNumber = contactNumber || doctor.contactNumber;
      doctor.email = email || doctor.email;

      const updatedDoctor = await doctor.save();
      logger.info(`Doctor updated: ${updatedDoctor.name}`);
      res.json(updatedDoctor);
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (error) {
    logger.error(`Update Doctor Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a doctor
// @route   DELETE /api/doctors/:id
// @access  Private/Admin
const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (doctor) {
      await doctor.deleteOne();
      logger.info(`Doctor deleted: ${req.params.id}`);
      res.json({ message: 'Doctor removed' });
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (error) {
    logger.error(`Delete Doctor Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
};
