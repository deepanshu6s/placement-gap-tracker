const express = require('express');
const RoleController = require('../controllers/role.controller');
const validateRequest = require('../middleware/validateRequest');
const { roleSchema, requirementSchema } = require('../validators/role.validator');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.use(authenticate);

// Publicly readable by authenticated users
router.get('/', RoleController.getAll);
router.get('/:id', RoleController.getById);
router.get('/:id/requirements', RoleController.getRequirements);

// Write ops restricted to faculty/admin
router.use(authorize(['faculty', 'admin']));
router.post('/', validateRequest(roleSchema), RoleController.create);
router.put('/:id', validateRequest(roleSchema), RoleController.update);
router.delete('/:id', RoleController.deactivate); // Maps to deactivate

router.post('/:id/requirements', validateRequest(requirementSchema), RoleController.addRequirement);
router.put('/:id/requirements/:skillId', validateRequest(requirementSchema.omit({skill_id: true})), RoleController.updateRequirement);
router.delete('/:id/requirements/:skillId', RoleController.removeRequirement);

module.exports = router;
