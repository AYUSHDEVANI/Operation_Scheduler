const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const logger = require('../logs/logger');

// @desc    Get All Users with Filtering and Pagination
// @route   GET /api/users
// @access  Private/SuperAdmin
const getUsers = async (req, res) => {
    try {
        const { role, page = 1, limit = 10, search } = req.query;
        let query = {};

        // Role Filter
        if (role && role !== 'all') {
            // Map frontend 'staff' to 'USER' if needed, or keep strictly as enum
            // User requested tabs: Admin, Staff, Doctor. 
            // My enum: ADMIN, USER, DOCTOR, SUPER_ADMIN.
            // Assumption: Staff tab -> USER role.
            query.role = role.toUpperCase();
        }

        // Search Filter (Name or Email)
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const count = await User.countDocuments(query);
        const users = await User.find(query)
            .select('-password') // Exclude password
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        res.json({
            users,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            totalUsers: count
        });

    } catch (error) {
        logger.error(`Get Users Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update User Role
// @route   PUT /api/users/:id/role
// @access  Private/SuperAdmin
// Top of file
const { sendRoleChangeNotification } = require('../services/emailService');

// ... existing code ...

const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findById(req.params.id);

        if (user) {
            user.role = role;
            await user.save();
            logger.info(`User role updated: ${user.email} -> ${role}`);
            
            // Send Email Notification
            // We use await here assuming it's fast enough or we can use the queue if preferred. 
            // Given the requirement "send a mail", direct call is fine, but queue is better.
            // Let's use the valid import. Ideally we should use emailQueue if we want it background.
            // Checking imports... I didn't import emailQueue here. 
            // I'll call the service directly for simplicity as per previous pattern or better, import emailQueue if available.
            // userController currently only has models.
            // Let's stick to direct service call for now to ensure it works immediately.
            try {
                await sendRoleChangeNotification(user.email, user.name, role);
            } catch (err) {
                logger.error(`Failed to send role update email: ${err.message}`);
            }

            res.json({ message: 'User role updated', user });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        logger.error(`Update Role Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete User
// @route   DELETE /api/users/:id
// @access  Private/SuperAdmin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await user.deleteOne(); // Hard Delete for now as per "delete anyone" request
            logger.info(`User deleted: ${req.params.id}`);
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        logger.error(`Delete User Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getUsers,
    updateUserRole,
    deleteUser
};
