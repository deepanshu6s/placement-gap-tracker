const express = require('express');
const QuestionController = require('../controllers/question.controller');
const validateRequest = require('../middleware/validateRequest');
const { questionSchema } = require('../validators/question.validator');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.use(authenticate);
router.use(authorize(['faculty', 'admin']));

router.get('/', QuestionController.getQuestions);
router.get('/:id', QuestionController.getQuestionById);
router.post('/', validateRequest(questionSchema), QuestionController.createQuestion);
router.delete('/:id', QuestionController.deactivateQuestion);

module.exports = router;
