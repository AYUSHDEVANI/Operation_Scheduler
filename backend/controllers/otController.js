const OperationTheatre = require('../models/OperationTheatre');
const logger = require('../logs/logger');

// @desc    Get all OTs
// @route   GET /api/ots
// @access  Protected
const getOTs = async (req, res) => {
  try {
    const ots = await OperationTheatre.find({});
    res.json(ots);
  } catch (error) {
    logger.error(`Get OTs Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get OT by ID
// @route   GET /api/ots/:id
// @access  Protected
const getOTById = async (req, res) => {
  try {
    const ot = await OperationTheatre.findById(req.params.id);
    if (ot) {
      res.json(ot);
    } else {
      res.status(404).json({ message: 'OT not found' });
    }
  } catch (error) {
    logger.error(`Get OT Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create an OT
// @route   POST /api/ots
// @access  Private/Admin
const createOT = async (req, res) => {
  const { otNumber, name, capacity, instruments, resources } = req.body;
  try {
    const otExists = await OperationTheatre.findOne({ otNumber });
    if (otExists) {
      return res.status(400).json({ message: 'OT Number already exists' });
    }

    const ot = new OperationTheatre({
      otNumber,
      name,
      capacity,
      instruments,
      resources
    });

    const createdOT = await ot.save();
    logger.info(`OT created: ${createdOT.otNumber}`);
    res.status(201).json(createdOT);
  } catch (error) {
    logger.error(`Create OT Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update an OT
// @route   PUT /api/ots/:id
// @access  Private/Admin
const updateOT = async (req, res) => {
  const { otNumber, name, status, instruments, resources } = req.body;
  
  try {
    const ot = await OperationTheatre.findById(req.params.id);

    if (ot) {
      ot.otNumber = otNumber || ot.otNumber;
      ot.name = name || ot.name;
      ot.status = status || ot.status;
      if (instruments) ot.instruments = instruments;
      if (resources) ot.resources = resources;

      const updatedOT = await ot.save();
      logger.info(`OT updated: ${updatedOT.otNumber}`);
      res.json(updatedOT);
    } else {
      res.status(404).json({ message: 'OT not found' });
    }
  } catch (error) {
    logger.error(`Update OT Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete an OT
// @route   DELETE /api/ots/:id
// @access  Private/Admin
const deleteOT = async (req, res) => {
  try {
    const ot = await OperationTheatre.findById(req.params.id);

    if (ot) {
      await ot.deleteOne();
      logger.info(`OT deleted: ${req.params.id}`);
      res.json({ message: 'OT removed' });
    } else {
      res.status(404).json({ message: 'OT not found' });
    }
  } catch (error) {
    logger.error(`Delete OT Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getOTs,
  getOTById,
  createOT,
  updateOT,
  deleteOT,
  // Additional specialized controller methods can be added (e.g., check availability)
};
