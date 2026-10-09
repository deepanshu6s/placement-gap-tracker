const { z } = require('zod');

const studentProfileSchema = z.object({
  full_name: z.string().min(2).max(150),
  branch: z.string().min(2).max(100),
  batch_year: z.number().int().min(2000).max(2100),
  roll_number: z.string().max(50).optional().nullable(),
  cgpa: z.number().min(0).max(10).optional().nullable(),
  linkedin_url: z.string().url().optional().nullable().or(z.literal('')),
  github_url: z.string().url().optional().nullable().or(z.literal('')),
  target_role_id: z.string().uuid().optional().nullable()
});

module.exports = {
  studentProfileSchema
};
