const express = require('express');
const SkillController = require('../controllers/skill.controller');
const validateRequest = require('../middleware/validateRequest');
const { skillSchema, assessmentConfigSchema } = require('../validators/skill.validator');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.use(authenticate);

// Publicly readable
router.get('/', SkillController.getAll);
router.get('/:id', SkillController.getById);
router.get('/:id/config', SkillController.getConfig);
router.get('/:id/question-counts', SkillController.getQuestionCounts);

// Write ops restricted to faculty/admin
router.use(authorize(['faculty', 'admin']));
router.post('/', validateRequest(skillSchema), SkillController.create);
router.put('/:id', validateRequest(skillSchema), SkillController.update);
router.delete('/:id', SkillController.deactivate);

router.put('/:id/config', validateRequest(assessmentConfigSchema), SkillController.updateConfig);

module.exports = router;
