const express = require('express');
const healthRoutes = require('./health.routes');

const router = express.Router();

// =============================================================================
// Foundation Routes (Phase 1)
// =============================================================================
router.use('/health', healthRoutes);

// =============================================================================
// Feature Routes (Planned for Phase 2+ - see API_CONTRACTS.md)
// =============================================================================
// router.use('/auth', authRoutes);                      // Member 1
// router.use('/students', studentRoutes);              // Member 1
// router.use('/roles', roleRoutes);                    // Member 3
// router.use('/skills', skillRoutes);                  // Member 3
// router.use('/questions', questionRoutes);            // Member 2
// router.use('/assessments', assessmentRoutes);        // Member 2
// router.use('/skill-gaps', skillGapRoutes);           // Member 3
// router.use('/readiness', readinessRoutes);           // Member 3
// router.use('/preparation', preparationRoutes);       // Member 4
// router.use('/recommendations', recommendationRoutes); // Member 4
// router.use('/analytics', analyticsRoutes);           // Member 5
// router.use('/faculty', facultyRoutes);               // Member 5

module.exports = router;
