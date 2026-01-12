const express = require('express');
const router = express.Router();
const {
  getOTs,
  getOTById,
  createOT,
  updateOT,
  deleteOT,
} = require('../controllers/otController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getOTs)
  .post(protect, admin, createOT);

router.route('/:id')
  .get(protect, getOTById)
  .put(protect, admin, updateOT)
  .delete(protect, admin, deleteOT);

module.exports = router;
