const AuditLog = require('../models/AuditLog');

// @desc    Get all audit logs
// @route   GET /api/audit-logs
// @access  Super Admin
const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category } = req.query;
    
    // START DEBUG
    // console.log(`Audit Request: Category=${category}, Search=${search}`);
    // END DEBUG

    let query = {};

    // Strict category filtering
    if (category && category !== 'all' && category !== '' && category !== 'undefined') {
        query['target.collectionName'] = category;
    }

    if (search && search.trim() !== '') {
         const searchRegex = { $regex: search, $options: 'i' };
         query.$or = [
             { 'actor.name': searchRegex },
             { action: searchRegex },
             { 'target.name': searchRegex },
             { 'target.collectionName': searchRegex } // Allow searching by type too
         ];
    }

    const count = await AuditLog.countDocuments(query);
    
    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({
        logs,
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
        totalLogs: count
    });
  } catch (error) {
    console.error('Audit Log Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getAuditLogs };
