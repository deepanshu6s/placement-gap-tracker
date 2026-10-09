const express = require('express');
const healthRoutes = require('./health.routes');

const authRoutes = require('./auth.routes');
const studentRoutes = require('./student.routes');
const roleRoutes = require('./role.routes');
const skillRoutes = require('./skill.routes');
const questionRoutes = require('./question.routes'); // <-- Add this
const assessmentRoutes = require('./assessment.routes');
const gapRoutes = require('./gap.routes');
const readinessRoutes = require('./readiness.routes');
const recommendationRoutes = require('./recommendation.routes');
const preparationRoutes = require('./preparation.routes');
const facultyRoutes = require('./faculty.routes');

const router = express.Router();

// Foundation Routes (Phase 1)
router.use('/health', healthRoutes);

// Feature Routes
router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/roles', roleRoutes);
router.use('/skills', skillRoutes);
router.use('/questions', questionRoutes); // <-- Add this
router.use('/assessments', assessmentRoutes);
router.use('/skill-gaps', gapRoutes);
router.use('/readiness', readinessRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/preparation', preparationRoutes);
router.use('/faculty', facultyRoutes);

module.exports = router;
