const Patient = require('../models/Patient');
const logger = require('../logs/logger');

// @desc    Get all patients
// @route   GET /api/patients
// @access  Protected
const getPatients = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { contactNumber: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const count = await Patient.countDocuments(query);
    const patients = await Patient.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    res.json({
      patients,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalPatients: count
    });
  } catch (error) {
    logger.error(`Get Patients Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get patient by ID
// @route   GET /api/patients/:id
// @access  Protected
const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (patient) {
      res.json(patient);
    } else {
      res.status(404).json({ message: 'Patient not found' });
    }
  } catch (error) {
    logger.error(`Get Patient Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a patient
// @route   POST /api/patients
// @access  Private/Admin (or User?)
const createPatient = async (req, res) => {
  const { name, age, gender, contactNumber, email, medicalHistory, pastSurgeries, assignedDoctor } = req.body;
  try {
    const patient = new Patient({
      name,
      age,
      gender,
      contactNumber,
      email,
      medicalHistory, // Expecting array of objects
      pastSurgeries,
      assignedDoctor
    });

    const createdPatient = await patient.save();
    logger.info(`Patient created: ${createdPatient.name}`);
    res.status(201).json(createdPatient);
  } catch (error) {
    logger.error(`Create Patient Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a patient
// @route   PUT /api/patients/:id
// @access  Private/Admin
const updatePatient = async (req, res) => {
  const { name, age, gender, contactNumber, email, medicalHistory, pastSurgeries, assignedDoctor } = req.body;
  
  try {
    const patient = await Patient.findById(req.params.id);

    if (patient) {
      patient.name = name || patient.name;
      patient.age = age || patient.age;
      patient.gender = gender || patient.gender;
      patient.contactNumber = contactNumber || patient.contactNumber;
      if (email !== undefined) patient.email = email; // Allow clearing or updating
      if (assignedDoctor !== undefined) patient.assignedDoctor = assignedDoctor; 
      if (medicalHistory) patient.medicalHistory = medicalHistory;
      if (pastSurgeries) patient.pastSurgeries = pastSurgeries;

      const updatedPatient = await patient.save();
      logger.info(`Patient updated: ${updatedPatient.name}`);
      res.json(updatedPatient);
    } else {
      res.status(404).json({ message: 'Patient not found' });
    }
  } catch (error) {
    logger.error(`Update Patient Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a patient
// @route   DELETE /api/patients/:id
// @access  Private/Admin
const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (patient) {
      await patient.deleteOne();
      logger.info(`Patient deleted: ${req.params.id}`);
      res.json({ message: 'Patient removed' });
    } else {
      res.status(404).json({ message: 'Patient not found' });
    }
  } catch (error) {
    logger.error(`Delete Patient Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
};
