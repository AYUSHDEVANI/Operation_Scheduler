const express = require('express');
const router = express.Router();
const { getResources, createResource, deleteResource, updateResource } = require('../controllers/resourceController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getResources)
  .post(protect, createResource);

router.route('/:id')
  .delete(protect, deleteResource)
  .put(protect, updateResource);

module.exports = router;
