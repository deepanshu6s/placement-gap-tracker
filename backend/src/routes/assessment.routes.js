const express = require('express');
const AssessmentController = require('../controllers/assessment.controller');
const validateRequest = require('../middleware/validateRequest');
const { startAttemptSchema, submitAttemptSchema } = require('../validators/assessment.validator');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// We need a middleware to ensure the user has a student profile ID attached
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

router.post('/start', validateRequest(startAttemptSchema), AssessmentController.startAttempt);
router.post('/attempts', validateRequest(startAttemptSchema), AssessmentController.startAttempt);
router.get('/:attemptId/questions', AssessmentController.getAttemptQuestions);
router.get('/attempts/:attemptId/questions', AssessmentController.getAttemptQuestions);
router.post('/:attemptId/submit', validateRequest(submitAttemptSchema), AssessmentController.submitAttempt);
router.post('/attempts/:attemptId/submit', validateRequest(submitAttemptSchema), AssessmentController.submitAttempt);
router.get('/:attemptId/result', AssessmentController.getAttemptResult);
router.get('/attempts/:attemptId/result', AssessmentController.getAttemptResult);

module.exports = router;
