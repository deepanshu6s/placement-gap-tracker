const { z } = require('zod');

const roleSchema = z.object({
  name: z.string().min(2).max(150),
  description: z.string().optional().nullable()
});

const requirementSchema = z.object({
  skill_id: z.string().uuid(),
  required_level: z.number().int().min(0).max(100),
  weight: z.number().int().min(1).max(5)
});

module.exports = {
  roleSchema,
  requirementSchema
};
