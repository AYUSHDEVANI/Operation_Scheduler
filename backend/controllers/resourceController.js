const Resource = require('../models/Resource');
const logger = require('../logs/logger');
const { logAction } = require('../utils/auditLogger');

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
    await logAction('CREATE_RESOURCE', req, { collectionName: 'resources', id: created._id, name: created.name }, { type, quantity, unit, lowStockThreshold });
    res.status(201).json(created);
  } catch (error) {
    logger.error(`Create Resource Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (resource) {
      await resource.deleteOne();
      logger.info(`Resource deleted: ${req.params.id}`);
      await logAction('DELETE_RESOURCE', req, { collectionName: 'resources', id: req.params.id, name: resource.name });
      res.json({ message: 'Resource removed' });
    } else {
      res.status(404).json({ message: 'Resource not found' });
    }
  } catch (error) {
    logger.error(`Delete Resource Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

const updateResource = async (req, res) => {
  const { name, type, quantity, unit, lowStockThreshold } = req.body;
  try {
    const resource = await Resource.findById(req.params.id);

    if (resource) {
      const changes = {};
      const fields = ['name', 'type', 'quantity', 'unit', 'lowStockThreshold'];

      fields.forEach(field => {
          if (req.body[field] !== undefined && req.body[field] != resource[field]) {
              changes[field] = { old: resource[field], new: req.body[field] };
              resource[field] = req.body[field];
          }
      });

      const updatedResource = await resource.save();
      logger.info(`Resource updated: ${updatedResource.name}`);

      if (Object.keys(changes).length > 0) {
          await logAction('UPDATE_RESOURCE', req, 
            { collectionName: 'resources', id: updatedResource._id, name: updatedResource.name }, 
            { changes, snapshot: updatedResource.toObject() }
          );
      }
      res.json(updatedResource);
    } else {
      res.status(404).json({ message: 'Resource not found' });
    }
  } catch (error) {
    logger.error(`Update Resource Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getResources, createResource, deleteResource, updateResource };
