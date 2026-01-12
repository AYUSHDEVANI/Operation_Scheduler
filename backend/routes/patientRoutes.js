const express = require('express');
const router = express.Router();
const {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
} = require('../controllers/patientController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getPatients)
  .post(protect, admin, createPatient);

router.route('/:id')
  .get(protect, getPatientById)
  .put(protect, admin, updatePatient)
  .delete(protect, admin, deletePatient);

module.exports = router;
