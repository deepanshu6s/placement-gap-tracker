const express = require('express');
const FacultyController = require('../controllers/faculty.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.use(authenticate);
router.use(authorize(['faculty', 'admin'])); // Both can access

router.get('/me', FacultyController.getProfile);
router.get('/students', FacultyController.getStudents);
router.get('/students/export', FacultyController.exportStudentsCSV);
router.get('/students/:studentId', FacultyController.getStudentDetails);
router.get('/students/:studentId/skill-gaps', FacultyController.getStudentSkillGaps);
router.get('/students/:studentId/preparation', FacultyController.getStudentPrepAggregate);
router.get('/analytics/batch', FacultyController.getBatchAnalytics);

// Faculty evidence review queue & actions
router.get('/evidence', FacultyController.getEvidenceQueue);
router.put('/evidence/:id/review', FacultyController.reviewEvidence);

module.exports = router;
