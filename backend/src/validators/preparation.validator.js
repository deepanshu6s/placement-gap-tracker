const { z } = require('zod');

const preparationSchema = z.object({
  skill_id: z.string().uuid().optional().nullable(),
  activity_type: z.enum(['study', 'practice', 'mock_test', 'video', 'reading', 'other']),
  description: z.string().optional().nullable(),
  resource_url: z.string().url().optional().nullable().or(z.literal('')),
  hours_spent: z.number().min(0.1).max(24),
  activity_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD')
});

module.exports = {
  preparationSchema
};
