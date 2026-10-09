const express = require('express');
const ReadinessController = require('../controllers/readiness.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const ensureStudentProfile = async (req, res, next) => {
  const StudentRepository = require('../repositories/student.repository');
  const profile = await StudentRepository.findByUserId(req.user.userId);
  if (!profile) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Student profile required' }});
  }
  req.user.studentProfileId = profile.id;
  req.user.targetRoleId = profile.target_role_id;
  next();
};

const router = express.Router();

router.use(authenticate);
router.use(authorize('student'));
router.use(ensureStudentProfile);

router.get('/me', ReadinessController.getMyScore);
router.get('/me/history', ReadinessController.getMyHistory);

module.exports = router;
