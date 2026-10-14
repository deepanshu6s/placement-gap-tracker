const express = require('express');
const StudentController = require('../controllers/student.controller');
const validateRequest = require('../middleware/validateRequest');
const { studentProfileSchema } = require('../validators/student.validator');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.use(authenticate);
router.use(authorize('student'));

router.get('/me', StudentController.getMyProfile);
router.post('/me', validateRequest(studentProfileSchema), StudentController.setupProfile);
router.post('/profile', validateRequest(studentProfileSchema), StudentController.setupProfile);
router.put('/me', validateRequest(studentProfileSchema), StudentController.updateMyProfile);

// Skill baseline flow
router.get('/skill-baseline', StudentController.getSkillBaseline);
router.post('/skill-baseline', StudentController.saveSkillBaseline);
router.put('/skill-baseline/:skillId', StudentController.updateSkillRating);

// Personalized preparation roadmap
router.get('/roadmap', StudentController.getRoadmap);

// Skill learning tasks
router.get('/skills/:skillId/tasks', StudentController.getSkillTasks);
router.put('/skills/:skillId/tasks/:taskKey', StudentController.updateSkillTask);

// Student evidence portfolio
router.get('/evidence', StudentController.getEvidence);
router.post('/evidence', StudentController.submitEvidence);
router.put('/evidence/:id', StudentController.updateEvidence);
router.delete('/evidence/:id', StudentController.deleteEvidence);

// Aggregated tasks and evidence stats
router.get('/stats/tasks-evidence', StudentController.getTaskAndEvidenceStats);

module.exports = router;
