/**
 * Migration: student_skill_baselines table
 * Allows students to record self-reported skill proficiency ratings (beginner, intermediate, proficient, not_sure)
 * without overwriting diagnostic assessment scores.
 */

exports.up = (pgm) => {
  pgm.createTable('student_skill_baselines', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    student_id: { type: 'uuid', notNull: true, references: '"student_profiles"', onDelete: 'CASCADE' },
    skill_id: { type: 'uuid', notNull: true, references: '"skills"', onDelete: 'CASCADE' },
    role_id: { type: 'uuid', references: '"career_roles"', onDelete: 'SET NULL' },
    proficiency_level: { type: 'varchar(50)', notNull: true },
    is_self_reported: { type: 'boolean', notNull: true, default: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });

  pgm.addConstraint('student_skill_baselines', 'uq_student_skill_baseline', 'UNIQUE (student_id, skill_id)');
  pgm.addConstraint(
    'student_skill_baselines',
    'chk_proficiency_level',
    "CHECK (proficiency_level IN ('beginner', 'intermediate', 'proficient', 'not_sure'))"
  );

  pgm.createIndex('student_skill_baselines', 'student_id', { name: 'idx_skill_baselines_student_id' });
  pgm.createIndex('student_skill_baselines', ['student_id', 'role_id'], { name: 'idx_skill_baselines_student_role' });
  pgm.createIndex('student_skill_baselines', 'skill_id', { name: 'idx_skill_baselines_skill_id' });
};

exports.down = (pgm) => {
  pgm.dropTable('student_skill_baselines', { ifExists: true, cascade: true });
};
