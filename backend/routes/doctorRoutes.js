const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} = require('../controllers/doctorController');
const { protect, admin, superAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getDoctors)
  .post(protect, superAdmin, createDoctor);

router.route('/:id')
  .get(protect, getDoctorById)
  .put(protect, admin, updateDoctor)
  .delete(protect, superAdmin, deleteDoctor);

module.exports = router;
