const express = require('express');
const router = express.Router();
const { getUsers, updateUserRole, deleteUser } = require('../controllers/userController');
const { protect, superAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, superAdmin, getUsers);

router.route('/:id/role')
  .put(protect, superAdmin, updateUserRole);

router.route('/:id')
  .delete(protect, superAdmin, deleteUser);

module.exports = router;
