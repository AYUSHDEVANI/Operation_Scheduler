const Resource = require('../models/Resource');
const logger = require('../logs/logger');

const getResources = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { type: { $regex: search, $options: 'i' } }
        ]
      };
    }
    const resources = await Resource.find(query);
    res.json(resources);
  } catch (error) {
    logger.error(`Get Resources Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

const createResource = async (req, res) => {
  const { name, type, quantity, unit, lowStockThreshold } = req.body;
  try {
    const resource = new Resource({ name, type, quantity, unit, lowStockThreshold });
    const created = await resource.save();
    res.status(201).json(created);
  } catch (error) {
    logger.error(`Create Resource Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getResources, createResource };
