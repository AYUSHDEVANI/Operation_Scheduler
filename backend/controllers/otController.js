const OperationTheatre = require('../models/OperationTheatre');
const Surgery = require('../models/Surgery'); // Added for availability check
const logger = require('../logs/logger');
const { logAction } = require('../utils/auditLogger');

// @desc    Get all OTs
// @route   GET /api/ots
// @access  Protected
const getOTs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const count = await OperationTheatre.countDocuments({});
    const ots = await OperationTheatre.find({})
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
        ots,
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
        totalOTs: count
    });
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
    await logAction('CREATE_OT', req, { collectionName: 'ots', id: createdOT._id, name: createdOT.name }, { otNumber, capacity });
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
      const changes = {};
      // Fields to check for updates
      const fields = ['otNumber', 'name', 'status'];
      
      fields.forEach(field => {
          if (req.body[field] !== undefined && req.body[field] != ot[field]) {
              changes[field] = { old: ot[field], new: req.body[field] };
              ot[field] = req.body[field];
          }
      });

      if (instruments) {
          // Simplified for arrays - logging that it changed
          changes['instruments'] = { old: '...', new: 'Updated' };
          ot.instruments = instruments;
      }
      if (resources) {
          changes['resources'] = { old: '...', new: 'Updated' };
          ot.resources = resources;
      }

      const updatedOT = await ot.save();
      logger.info(`OT updated: ${updatedOT.name}`);
      
      if (Object.keys(changes).length > 0) {
          await logAction('UPDATE_OT', req, 
            { collectionName: 'ots', id: updatedOT._id, name: updatedOT.name }, 
            { changes, snapshot: updatedOT.toObject() }
          );
      }
      
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
      await logAction('DELETE_OT', req, { collectionName: 'ots', id: req.params.id, name: ot.name });
      res.json({ message: 'OT removed' });
    } else {
      res.status(404).json({ message: 'OT not found' });
    }
  } catch (error) {
    logger.error(`Delete OT Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get Available OTs for a specific time slot
// @route   GET /api/ots/available
// @access  Protected
const getAvailableOTs = async (req, res) => {
  try {
    const { date, startTime, endTime } = req.query;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({ message: 'Please provide date, startTime, and endTime' });
    }

    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);

    // 1. Find all OTs
    const allOTs = await OperationTheatre.find({}); // Fetch all OTs

    // 2. Find surgeries that overlap with this time
    const conflictingSurgeries = await Surgery.find({
      status: { $in: ['Scheduled', 'Rescheduled', 'Emergency'] },
      $or: [
        { startDateTime: { $lt: endDateTime, $gte: startDateTime } },
        { endDateTime: { $gt: startDateTime, $lte: endDateTime } },
        { startDateTime: { $lte: startDateTime }, endDateTime: { $gte: endDateTime } }
      ]
    }).select('operationTheatre');

    // 3. Extract occupied OT IDs
    const occupiedOTIds = conflictingSurgeries.map(s => s.operationTheatre.toString());

    // 4. Filter OTs
    const availableOTs = allOTs.filter(ot => !occupiedOTIds.includes(ot._id.toString()));

    res.json(availableOTs);

  } catch (error) {
    logger.error(`Check Availability Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getOTs,
  getOTById,
  createOT,
  updateOT,
  deleteOT,
  getAvailableOTs
};
