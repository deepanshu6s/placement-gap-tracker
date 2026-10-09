const { z } = require('zod');

const startAttemptSchema = z.object({
  skill_id: z.string().uuid()
});

const submitAttemptSchema = z.object({
  answers: z.array(z.object({
    question_id: z.string().uuid(),
    selected_option_id: z.string().uuid().nullable().optional()
  }))
});

module.exports = {
  startAttemptSchema,
  submitAttemptSchema
};
