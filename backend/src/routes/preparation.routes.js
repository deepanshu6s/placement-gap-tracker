const express = require('express');
const PreparationController = require('../controllers/preparation.controller');
const validateRequest = require('../middleware/validateRequest');
const { preparationSchema } = require('../validators/preparation.validator');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const ensureStudentProfile = async (req, res, next) => {
  const StudentRepository = require('../repositories/student.repository');
  const profile = await StudentRepository.findByUserId(req.user.userId);
  if (!profile) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Student profile required' }});
  }
  req.user.studentProfileId = profile.id;
  next();
};

const router = express.Router();

router.use(authenticate);
router.use(authorize('student'));
router.use(ensureStudentProfile);

router.get('/me', PreparationController.getMyActivities);
router.post('/me', validateRequest(preparationSchema), PreparationController.logActivity);
router.post('/log', validateRequest(preparationSchema), PreparationController.logActivity);
router.put('/me/:id', validateRequest(preparationSchema), PreparationController.updateActivity);
router.delete('/me/:id', PreparationController.deleteActivity);

module.exports = router;
