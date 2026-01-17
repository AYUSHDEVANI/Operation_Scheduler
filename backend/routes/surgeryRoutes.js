const express = require('express');
const router = express.Router();
const { getSurgeries, getSurgeryById, createSurgery, updateSurgery, deleteSurgery, getSurgeryStats } = require('../controllers/surgeryController');
const { protect, admin } = require('../middleware/authMiddleware');

const validate = require('../middleware/validate');
const { surgerySchema } = require('../middleware/validationSchemas');

router.get('/', protect, getSurgeries);
router.get('/stats', protect, getSurgeryStats); // Specific route first
router.post('/', protect, admin, validate(surgerySchema), createSurgery);
router.get('/:id', protect, getSurgeryById);
router.put('/:id', protect, admin, updateSurgery);
router.delete('/:id', protect, admin, deleteSurgery);

module.exports = router;
