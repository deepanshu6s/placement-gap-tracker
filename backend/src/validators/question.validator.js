const { z } = require('zod');

const questionSchema = z.object({
  skill_id: z.string().uuid(),
  question_text: z.string().min(5),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  options: z.array(z.object({
    option_text: z.string().min(1),
    is_correct: z.boolean(),
    display_order: z.number().int().min(1)
  })).min(2).max(10)
});

module.exports = {
  questionSchema
};
