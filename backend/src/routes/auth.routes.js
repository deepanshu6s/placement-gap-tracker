const express = require('express');
const AuthController = require('../controllers/auth.controller');
const validateRequest = require('../middleware/validateRequest');
const { registerSchema, loginSchema, refreshSchema } = require('../validators/auth.validator');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.post('/register', validateRequest(registerSchema), AuthController.register);
router.post('/login', validateRequest(loginSchema), AuthController.login);
router.post('/refresh', validateRequest(refreshSchema), AuthController.refresh);
router.post('/logout', AuthController.logout);
router.get('/me', authenticate, AuthController.me);

module.exports = router;
