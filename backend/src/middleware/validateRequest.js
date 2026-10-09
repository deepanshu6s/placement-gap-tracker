const { z } = require('zod');
const { errorResponse } = require('../utils/response.utils');

const validateRequest = (schema) => async (req, res, next) => {
  try {
    req.body = await schema.parseAsync(req.body);
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      const issues = err.issues.map(i => ({ path: i.path.join('.'), message: i.message }));
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: issues
        }
      });
    }
    next(err);
  }
};

module.exports = validateRequest;
