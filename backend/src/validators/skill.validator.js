const { z } = require('zod');

const skillSchema = z.object({
  name: z.string().min(2).max(150),
  category: z.enum(['technical', 'soft', 'domain', 'aptitude']),
  description: z.string().optional().nullable()
});

const assessmentConfigSchema = z.object({
  total_questions: z.number().int().min(1),
  time_limit_minutes: z.number().int().min(1),
  easy_count: z.number().int().min(0),
  medium_count: z.number().int().min(0),
  hard_count: z.number().int().min(0),
  cooldown_hours: z.number().int().min(0)
});

module.exports = {
  skillSchema,
  assessmentConfigSchema
};
