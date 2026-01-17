const express = require('express');
const router = express.Router();
const {
  getOTs,
  getOTById,
  createOT,
  updateOT,
  deleteOT,
  getAvailableOTs
} = require('../controllers/otController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/available', protect, getAvailableOTs);

const validate = require('../middleware/validate');
const { otSchema } = require('../middleware/validationSchemas');

router.route('/')
  .get(protect, getOTs)
  .post(protect, admin, validate(otSchema), createOT);

router.route('/:id')
  .get(protect, getOTById)
  .put(protect, admin, updateOT)
  .delete(protect, admin, deleteOT);

module.exports = router;
