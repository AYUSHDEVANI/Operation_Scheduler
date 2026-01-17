const AuditLog = require('../models/AuditLog');

const logAction = async (action, req, target, details = {}) => {
  try {
    if (!req.user) {
        console.warn('Audit Log Skipped: No user in request');
        return;
    }

    // Ensure target has structure
    const safeTarget = {
        collectionName: target?.collectionName || 'unknown',
        id: target?.id?.toString() || '',
        name: target?.name || 'Unknown'
    };

    await AuditLog.create({
      action,
      actor: {
        id: req.user._id,
        name: req.user.name,
        role: req.user.role
      },
      target: safeTarget,
      details
    });
    // console.log(`Audit Logged: ${action} on ${safeTarget.collectionName}`);
  } catch (error) {
    console.error('Audit Log Failed:', error);
  }
};

module.exports = { logAction };
