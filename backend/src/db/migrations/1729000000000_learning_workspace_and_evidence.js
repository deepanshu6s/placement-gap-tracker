/**
 * Migration: Learning Workspace Task Progress, Evidence Portfolio & Question Explanations
 *
 * 1. student_task_progress: Tracks individual skill learning tasks (not_started, in_progress, completed)
 * 2. student_evidence: Student project/certification/work submissions supporting claimed skills
 * 3. questions table: Adds explanation and concept_tested columns for assessment remediation
 */

/* eslint-disable camelcase */
exports.up = (pgm) => {
  // 1. TABLE: student_task_progress
  pgm.createTable('student_task_progress', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    student_id: { type: 'uuid', notNull: true, references: '"student_profiles"', onDelete: 'CASCADE' },
    skill_id: { type: 'uuid', notNull: true, references: '"skills"', onDelete: 'CASCADE' },
    task_key: { type: 'varchar(100)', notNull: true },
    status: {
      type: 'varchar(30)',
      notNull: true,
      default: 'not_started',
    },
    notes: { type: 'text' },
    completed_at: { type: 'timestamptz' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });

  pgm.addConstraint('student_task_progress', 'uq_student_skill_task', 'UNIQUE (student_id, skill_id, task_key)');
  pgm.addConstraint(
    'student_task_progress',
    'chk_task_status',
    "CHECK (status IN ('not_started', 'in_progress', 'completed'))"
  );
  pgm.createIndex('student_task_progress', 'student_id', { name: 'idx_task_progress_student_id' });
  pgm.createIndex('student_task_progress', ['student_id', 'skill_id'], { name: 'idx_task_progress_student_skill' });

  // 2. TABLE: student_evidence
  pgm.createTable('student_evidence', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    student_id: { type: 'uuid', notNull: true, references: '"student_profiles"', onDelete: 'CASCADE' },
    skill_id: { type: 'uuid', notNull: true, references: '"skills"', onDelete: 'CASCADE' },
    title: { type: 'varchar(255)', notNull: true },
    evidence_type: {
      type: 'varchar(50)',
      notNull: true,
    },
    description: { type: 'text', notNull: true },
    url: { type: 'text' },
    status: {
      type: 'varchar(50)',
      notNull: true,
      default: 'submitted',
    },
    reviewer_id: { type: 'uuid', references: '"faculty_profiles"', onDelete: 'SET NULL' },
    faculty_feedback: { type: 'text' },
    submitted_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    reviewed_at: { type: 'timestamptz' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });

  pgm.addConstraint(
    'student_evidence',
    'chk_evidence_type',
    "CHECK (evidence_type IN ('github_repo', 'live_demo', 'project', 'certification', 'course', 'assignment', 'written_work', 'other'))"
  );
  pgm.addConstraint(
    'student_evidence',
    'chk_evidence_status',
    "CHECK (status IN ('submitted', 'under_review', 'accepted', 'needs_improvement'))"
  );
  pgm.createIndex('student_evidence', 'student_id', { name: 'idx_evidence_student_id' });
  pgm.createIndex('student_evidence', ['student_id', 'skill_id'], { name: 'idx_evidence_student_skill' });
  pgm.createIndex('student_evidence', 'status', { name: 'idx_evidence_status' });

  // 3. TABLE: questions - add explanation and concept_tested
  pgm.addColumn('questions', {
    explanation: { type: 'text' },
    concept_tested: { type: 'varchar(255)' },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('questions', ['explanation', 'concept_tested'], { ifExists: true });
  pgm.dropTable('student_evidence', { ifExists: true, cascade: true });
  pgm.dropTable('student_task_progress', { ifExists: true, cascade: true });
};
