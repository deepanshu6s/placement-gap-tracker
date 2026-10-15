const express = require('express');
const FacultyController = require('../controllers/faculty.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.use(authenticate);
router.use(authorize(['faculty', 'admin'])); // Both can access

// Profile & students
router.get('/me', FacultyController.getProfile);
router.get('/students', FacultyController.getStudents);
router.get('/students/export', FacultyController.exportStudentsCSV);
router.get('/students/:studentId', FacultyController.getStudentDetails);
router.get('/students/:studentId/skill-gaps', FacultyController.getStudentSkillGaps);
router.get('/students/:studentId/preparation', FacultyController.getStudentPrepAggregate);

// Legacy batch analytics endpoint
router.get('/analytics/batch', FacultyController.getBatchAnalytics);

// Analytics endpoints (Phase 1-4 of TASK 4)
router.get('/analytics/overview', FacultyController.getAnalyticsOverview);
router.get('/analytics/role-distribution', FacultyController.getAnalyticsRoleDistribution);
router.get('/analytics/skill-gaps', FacultyController.getAnalyticsSkillGaps);
router.get('/analytics/student-support', FacultyController.getStudentSupportList);
router.get('/analytics/insights', FacultyController.getAnalyticsInsights);
router.get('/analytics/export', FacultyController.exportAnalyticsCSV);

// Faculty evidence review queue & actions
router.get('/evidence', FacultyController.getEvidenceQueue);
router.get('/evidence/review-queue', FacultyController.getEvidenceQueue);
router.put('/evidence/:id/review', FacultyController.reviewEvidence);

module.exports = router;
