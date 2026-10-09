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

module.exports = router;
