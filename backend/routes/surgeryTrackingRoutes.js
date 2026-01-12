const express = require('express');
const router = express.Router();
const { getTrackingBySurgeryId, updateTracking } = require('../controllers/surgeryTrackingController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/:surgeryId', protect, getTrackingBySurgeryId);
router.post('/', protect, upload.single('file'), updateTracking);

module.exports = router;
