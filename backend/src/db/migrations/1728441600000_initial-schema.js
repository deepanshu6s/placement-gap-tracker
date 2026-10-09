/**
 * Migration: Initial MVP Schema — 20 Operational Tables
 * Based on: docs/architecture_spec_v1_1.md (Approved Final v1.1)
 * Decisions applied: PHA-07, PHA-10, PHA-11, PHA-15, PHA-D06, PHA-D13
 */

/* eslint-disable camelcase */
exports.up = (pgm) => {
  // ENUMS
  pgm.createType('user_role', ['student', 'faculty', 'admin']);
  pgm.createType('skill_category', ['technical', 'soft', 'domain', 'aptitude']);
  pgm.createType('question_difficulty', ['easy', 'medium', 'hard']);
  pgm.createType('attempt_status', ['in_progress', 'completed', 'timed_out', 'abandoned']);
  pgm.createType('gap_category', ['none', 'small', 'medium', 'critical']);
  pgm.createType('recommendation_priority', ['high', 'medium', 'low']);
  pgm.createType('recommendation_type', [
    'take_assessment',
    'practice_skill',
    'study_resource',
    'review_weak_area',
  ]);
  pgm.createType('activity_type', ['study', 'practice', 'mock_test', 'video', 'reading', 'other']);

  // TABLE 1: users
  pgm.createTable('users', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    password_hash: { type: 'text', notNull: true },
    role: { type: 'user_role', notNull: true },
    is_active: { type: 'boolean', notNull: true, default: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.createIndex('users', 'email', { name: 'idx_users_email' });
  pgm.createIndex('users', 'role', { name: 'idx_users_role' });

  // TABLE 2: refresh_tokens
  pgm.createTable('refresh_tokens', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: { type: 'uuid', notNull: true, references: '"users"', onDelete: 'CASCADE' },
    token_hash: { type: 'text', notNull: true },
    expires_at: { type: 'timestamptz', notNull: true },
    revoked: { type: 'boolean', notNull: true, default: false },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.createIndex('refresh_tokens', 'user_id', { name: 'idx_refresh_tokens_user_id' });
  pgm.createIndex('refresh_tokens', 'token_hash', { name: 'idx_refresh_tokens_hash' });

  // TABLE 6: career_roles (before student_profiles due to FK)
  pgm.createTable('career_roles', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    name: { type: 'varchar(150)', notNull: true, unique: true },
    description: { type: 'text' },
    is_active: { type: 'boolean', notNull: true, default: true },
    created_by: { type: 'uuid', references: '"users"', onDelete: 'SET NULL' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.createIndex('career_roles', 'is_active', { name: 'idx_career_roles_active' });

  // TABLE 3: student_profiles
  pgm.createTable('student_profiles', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: { type: 'uuid', notNull: true, unique: true, references: '"users"', onDelete: 'CASCADE' },
    full_name: { type: 'varchar(150)', notNull: true },
    roll_number: { type: 'varchar(50)', unique: true },
    branch: { type: 'varchar(100)', notNull: true },
    batch_year: { type: 'integer', notNull: true },
    cgpa: { type: 'numeric(4,2)' },
    linkedin_url: { type: 'text' },
    github_url: { type: 'text' },
    target_role_id: { type: 'uuid', references: '"career_roles"', onDelete: 'SET NULL' },
    profile_completed: { type: 'boolean', notNull: true, default: false },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.addConstraint('student_profiles', 'chk_student_profiles_batch_year', 'CHECK (batch_year BETWEEN 2000 AND 2100)');
  pgm.addConstraint('student_profiles', 'chk_student_profiles_cgpa', 'CHECK (cgpa IS NULL OR (cgpa >= 0 AND cgpa <= 10))');
  pgm.createIndex('student_profiles', 'user_id', { name: 'idx_student_profiles_user_id' });
  pgm.createIndex('student_profiles', 'batch_year', { name: 'idx_student_profiles_batch_year' });
  pgm.createIndex('student_profiles', ['batch_year', 'branch'], { name: 'idx_student_profiles_batch_branch' });
  pgm.createIndex('student_profiles', 'target_role_id', { name: 'idx_student_profiles_target_role' });

  // TABLE 4: faculty_profiles
  pgm.createTable('faculty_profiles', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: { type: 'uuid', notNull: true, unique: true, references: '"users"', onDelete: 'CASCADE' },
    full_name: { type: 'varchar(150)', notNull: true },
    department: { type: 'varchar(100)' },
    is_tpo: { type: 'boolean', notNull: true, default: false },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.createIndex('faculty_profiles', 'user_id', { name: 'idx_faculty_profiles_user_id' });

  // TABLE 5: faculty_batch_scope
  pgm.createTable('faculty_batch_scope', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    faculty_profile_id: { type: 'uuid', notNull: true, references: '"faculty_profiles"', onDelete: 'CASCADE' },
    batch_year: { type: 'integer', notNull: true },
    branch: { type: 'varchar(100)', notNull: true },
  });
  pgm.addConstraint('faculty_batch_scope', 'uq_faculty_batch_scope', 'UNIQUE (faculty_profile_id, batch_year, branch)');
  pgm.createIndex('faculty_batch_scope', 'faculty_profile_id', { name: 'idx_faculty_batch_scope_faculty_id' });
  pgm.createIndex('faculty_batch_scope', ['batch_year', 'branch'], { name: 'idx_faculty_batch_scope_batch_branch' });

  // TABLE 7: skills
  pgm.createTable('skills', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    name: { type: 'varchar(150)', notNull: true, unique: true },
    category: { type: 'skill_category', notNull: true },
    description: { type: 'text' },
    is_active: { type: 'boolean', notNull: true, default: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.createIndex('skills', 'is_active', { name: 'idx_skills_active' });
  pgm.createIndex('skills', 'category', { name: 'idx_skills_category' });

  // TABLE 8: role_skill_requirements
  pgm.createTable('role_skill_requirements', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    role_id: { type: 'uuid', notNull: true, references: '"career_roles"', onDelete: 'CASCADE' },
    skill_id: { type: 'uuid', notNull: true, references: '"skills"', onDelete: 'CASCADE' },
    required_level: { type: 'integer', notNull: true },
    weight: { type: 'integer', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.addConstraint('role_skill_requirements', 'uq_role_skill', 'UNIQUE (role_id, skill_id)');
  pgm.addConstraint('role_skill_requirements', 'chk_required_level', 'CHECK (required_level >= 0 AND required_level <= 100)');
  pgm.addConstraint('role_skill_requirements', 'chk_weight', 'CHECK (weight >= 1 AND weight <= 5)');
  pgm.createIndex('role_skill_requirements', 'role_id', { name: 'idx_role_skill_req_role_id' });
  pgm.createIndex('role_skill_requirements', 'skill_id', { name: 'idx_role_skill_req_skill_id' });

  // TABLE 9: questions
  pgm.createTable('questions', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    skill_id: { type: 'uuid', notNull: true, references: '"skills"', onDelete: 'RESTRICT' },
    question_text: { type: 'text', notNull: true },
    difficulty: { type: 'question_difficulty', notNull: true },
    is_active: { type: 'boolean', notNull: true, default: true },
    created_by: { type: 'uuid', references: '"users"', onDelete: 'SET NULL' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.createIndex('questions', ['skill_id', 'difficulty', 'is_active'], { name: 'idx_questions_skill_diff_active' });

  // TABLE 10: question_options
  pgm.createTable('question_options', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    question_id: { type: 'uuid', notNull: true, references: '"questions"', onDelete: 'CASCADE' },
    option_text: { type: 'text', notNull: true },
    is_correct: { type: 'boolean', notNull: true, default: false },
    display_order: { type: 'integer', notNull: true },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.sql('CREATE UNIQUE INDEX uq_one_correct_per_question ON question_options (question_id) WHERE is_correct = true;');
  pgm.createIndex('question_options', 'question_id', { name: 'idx_question_options_question_id' });

  // TABLE 11: assessment_configs
  pgm.createTable('assessment_configs', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    skill_id: { type: 'uuid', notNull: true, unique: true, references: '"skills"', onDelete: 'CASCADE' },
    total_questions: { type: 'integer', notNull: true, default: 10 },
    time_limit_minutes: { type: 'integer', notNull: true, default: 15 },
    easy_count: { type: 'integer', notNull: true, default: 3 },
    medium_count: { type: 'integer', notNull: true, default: 5 },
    hard_count: { type: 'integer', notNull: true, default: 2 },
    cooldown_hours: { type: 'integer', notNull: true, default: 24 },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.addConstraint('assessment_configs', 'chk_total_questions', 'CHECK (total_questions >= 1)');
  pgm.addConstraint('assessment_configs', 'chk_time_limit', 'CHECK (time_limit_minutes >= 1)');
  pgm.addConstraint('assessment_configs', 'chk_easy_count', 'CHECK (easy_count >= 0)');
  pgm.addConstraint('assessment_configs', 'chk_medium_count', 'CHECK (medium_count >= 0)');
  pgm.addConstraint('assessment_configs', 'chk_hard_count', 'CHECK (hard_count >= 0)');
  pgm.addConstraint('assessment_configs', 'chk_cooldown', 'CHECK (cooldown_hours >= 0)');
  pgm.addConstraint('assessment_configs', 'chk_question_sum', 'CHECK (easy_count + medium_count + hard_count = total_questions)');

  // TABLE 12: assessment_attempts
  pgm.createTable('assessment_attempts', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    student_id: { type: 'uuid', notNull: true, references: '"student_profiles"', onDelete: 'CASCADE' },
    skill_id: { type: 'uuid', notNull: true, references: '"skills"', onDelete: 'RESTRICT' },
    started_at: { type: 'timestamptz', notNull: true },
    submitted_at: { type: 'timestamptz' },
    status: { type: 'attempt_status', notNull: true, default: 'in_progress' },
    raw_score: { type: 'numeric(5,2)' },
    skill_score: { type: 'integer' },
    questions_served: { type: 'integer', notNull: true },
  });
  pgm.addConstraint('assessment_attempts', 'chk_skill_score', 'CHECK (skill_score IS NULL OR (skill_score >= 0 AND skill_score <= 100))');
  pgm.sql("CREATE UNIQUE INDEX one_active_attempt_per_student_skill ON assessment_attempts (student_id, skill_id) WHERE status = 'in_progress';");
  pgm.createIndex('assessment_attempts', ['student_id', 'skill_id', 'status'], { name: 'idx_attempts_student_skill_status' });
  pgm.createIndex('assessment_attempts', 'student_id', { name: 'idx_attempts_student_id' });

  // TABLE 13: attempt_questions
  pgm.createTable('attempt_questions', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    attempt_id: { type: 'uuid', notNull: true, references: '"assessment_attempts"', onDelete: 'CASCADE' },
    question_id: { type: 'uuid', notNull: true, references: '"questions"', onDelete: 'RESTRICT' },
    display_order: { type: 'integer', notNull: true },
  });
  pgm.addConstraint('attempt_questions', 'uq_attempt_question', 'UNIQUE (attempt_id, question_id)');
  pgm.createIndex('attempt_questions', 'attempt_id', { name: 'idx_attempt_questions_attempt_id' });

  // TABLE 14: attempt_answers
  pgm.createTable('attempt_answers', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    attempt_id: { type: 'uuid', notNull: true, references: '"assessment_attempts"', onDelete: 'CASCADE' },
    question_id: { type: 'uuid', notNull: true, references: '"questions"', onDelete: 'RESTRICT' },
    selected_option_id: { type: 'uuid', references: '"question_options"', onDelete: 'RESTRICT' },
    is_correct: { type: 'boolean', notNull: true },
  });
  pgm.addConstraint('attempt_answers', 'uq_attempt_answer', 'UNIQUE (attempt_id, question_id)');
  pgm.createIndex('attempt_answers', 'attempt_id', { name: 'idx_attempt_answers_attempt_id' });

  // TABLE 15: student_skill_scores
  pgm.createTable('student_skill_scores', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    student_id: { type: 'uuid', notNull: true, references: '"student_profiles"', onDelete: 'CASCADE' },
    skill_id: { type: 'uuid', notNull: true, references: '"skills"', onDelete: 'RESTRICT' },
    current_score: { type: 'integer', notNull: true },
    best_score: { type: 'integer', notNull: true },
    attempt_count: { type: 'integer', notNull: true, default: 1 },
    last_attempted_at: { type: 'timestamptz', notNull: true },
  });
  pgm.addConstraint('student_skill_scores', 'uq_student_skill_score', 'UNIQUE (student_id, skill_id)');
  pgm.addConstraint('student_skill_scores', 'chk_current_score', 'CHECK (current_score >= 0 AND current_score <= 100)');
  pgm.addConstraint('student_skill_scores', 'chk_best_score', 'CHECK (best_score >= 0 AND best_score <= 100)');
  pgm.addConstraint('student_skill_scores', 'chk_attempt_count', 'CHECK (attempt_count >= 1)');
  pgm.createIndex('student_skill_scores', 'student_id', { name: 'idx_skill_scores_student_id' });

  // TABLE 16: skill_gaps
  pgm.createTable('skill_gaps', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    student_id: { type: 'uuid', notNull: true, references: '"student_profiles"', onDelete: 'CASCADE' },
    role_id: { type: 'uuid', notNull: true, references: '"career_roles"', onDelete: 'CASCADE' },
    skill_id: { type: 'uuid', notNull: true, references: '"skills"', onDelete: 'RESTRICT' },
    required_level: { type: 'integer', notNull: true },
    current_score: { type: 'integer', notNull: true },
    gap: { type: 'integer', notNull: true },
    gap_category: { type: 'gap_category', notNull: true },
    is_assessed: { type: 'boolean', notNull: true, default: false },
    computed_at: { type: 'timestamptz', notNull: true },
  });
  pgm.addConstraint('skill_gaps', 'uq_skill_gap', 'UNIQUE (student_id, role_id, skill_id)');
  pgm.addConstraint('skill_gaps', 'chk_gap', 'CHECK (gap >= 0 AND gap <= 100)');
  pgm.createIndex('skill_gaps', ['student_id', 'role_id'], { name: 'idx_skill_gaps_student_role' });

  // TABLE 17: readiness_scores
  pgm.createTable('readiness_scores', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    student_id: { type: 'uuid', notNull: true, references: '"student_profiles"', onDelete: 'CASCADE' },
    role_id: { type: 'uuid', notNull: true, references: '"career_roles"', onDelete: 'CASCADE' },
    score: { type: 'numeric(5,2)' },
    computed_at: { type: 'timestamptz', notNull: true },
  });
  pgm.addConstraint('readiness_scores', 'uq_readiness_score', 'UNIQUE (student_id, role_id)');
  pgm.addConstraint('readiness_scores', 'chk_score', 'CHECK (score IS NULL OR (score >= 0 AND score <= 100))');
  pgm.createIndex('readiness_scores', 'student_id', { name: 'idx_readiness_scores_student_id' });

  // TABLE 18: readiness_score_history
  pgm.createTable('readiness_score_history', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    student_id: { type: 'uuid', notNull: true, references: '"student_profiles"', onDelete: 'CASCADE' },
    role_id: { type: 'uuid', notNull: true, references: '"career_roles"', onDelete: 'RESTRICT' },
    score: { type: 'numeric(5,2)', notNull: true },
    recorded_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.addConstraint('readiness_score_history', 'chk_history_score', 'CHECK (score >= 0 AND score <= 100)');
  pgm.createIndex('readiness_score_history', ['student_id', 'role_id', 'recorded_at'], { name: 'idx_readiness_history_student_role_time' });

  // TABLE 19: preparation_activities
  pgm.createTable('preparation_activities', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    student_id: { type: 'uuid', notNull: true, references: '"student_profiles"', onDelete: 'CASCADE' },
    skill_id: { type: 'uuid', references: '"skills"', onDelete: 'SET NULL' },
    activity_type: { type: 'activity_type', notNull: true },
    description: { type: 'text' },
    resource_url: { type: 'text' },
    hours_spent: { type: 'numeric(4,2)', notNull: true },
    activity_date: { type: 'date', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.addConstraint('preparation_activities', 'chk_hours_spent', 'CHECK (hours_spent > 0 AND hours_spent <= 24)');
  pgm.createIndex('preparation_activities', 'student_id', { name: 'idx_prep_activities_student_id' });
  pgm.createIndex('preparation_activities', ['student_id', 'skill_id'], { name: 'idx_prep_activities_student_skill' });
  pgm.createIndex('preparation_activities', ['student_id', 'activity_date'], { name: 'idx_prep_activities_student_date' });

  // TABLE 20: recommendations
  pgm.createTable('recommendations', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    student_id: { type: 'uuid', notNull: true, references: '"student_profiles"', onDelete: 'CASCADE' },
    role_id: { type: 'uuid', notNull: true, references: '"career_roles"', onDelete: 'CASCADE' },
    skill_id: { type: 'uuid', references: '"skills"', onDelete: 'CASCADE' },
    priority: { type: 'recommendation_priority', notNull: true },
    recommendation_type: { type: 'recommendation_type', notNull: true },
    message: { type: 'text', notNull: true },
    is_dismissed: { type: 'boolean', notNull: true, default: false },
    generated_at: { type: 'timestamptz', notNull: true },
    dismissed_at: { type: 'timestamptz' },
  });
  pgm.sql('CREATE UNIQUE INDEX uq_recommendation_with_skill ON recommendations (student_id, role_id, skill_id, recommendation_type) WHERE skill_id IS NOT NULL;');
  pgm.sql('CREATE UNIQUE INDEX uq_recommendation_no_skill ON recommendations (student_id, role_id, recommendation_type) WHERE skill_id IS NULL;');
  pgm.sql('CREATE INDEX idx_recommendations_active ON recommendations (student_id, role_id) WHERE is_dismissed = false;');
  pgm.createIndex('recommendations', 'student_id', { name: 'idx_recommendations_student_id' });
};

exports.down = (pgm) => {
  pgm.dropTable('recommendations', { ifExists: true, cascade: true });
  pgm.dropTable('preparation_activities', { ifExists: true, cascade: true });
  pgm.dropTable('readiness_score_history', { ifExists: true, cascade: true });
  pgm.dropTable('readiness_scores', { ifExists: true, cascade: true });
  pgm.dropTable('skill_gaps', { ifExists: true, cascade: true });
  pgm.dropTable('student_skill_scores', { ifExists: true, cascade: true });
  pgm.dropTable('attempt_answers', { ifExists: true, cascade: true });
  pgm.dropTable('attempt_questions', { ifExists: true, cascade: true });
  pgm.dropTable('assessment_attempts', { ifExists: true, cascade: true });
  pgm.dropTable('assessment_configs', { ifExists: true, cascade: true });
  pgm.dropTable('question_options', { ifExists: true, cascade: true });
  pgm.dropTable('questions', { ifExists: true, cascade: true });
  pgm.dropTable('role_skill_requirements', { ifExists: true, cascade: true });
  pgm.dropTable('skills', { ifExists: true, cascade: true });
  pgm.dropTable('faculty_batch_scope', { ifExists: true, cascade: true });
  pgm.dropTable('faculty_profiles', { ifExists: true, cascade: true });
  pgm.dropTable('student_profiles', { ifExists: true, cascade: true });
  pgm.dropTable('career_roles', { ifExists: true, cascade: true });
  pgm.dropTable('refresh_tokens', { ifExists: true, cascade: true });
  pgm.dropTable('users', { ifExists: true, cascade: true });
  pgm.dropType('activity_type', { ifExists: true });
  pgm.dropType('recommendation_type', { ifExists: true });
  pgm.dropType('recommendation_priority', { ifExists: true });
  pgm.dropType('gap_category', { ifExists: true });
  pgm.dropType('attempt_status', { ifExists: true });
  pgm.dropType('question_difficulty', { ifExists: true });
  pgm.dropType('skill_category', { ifExists: true });
  pgm.dropType('user_role', { ifExists: true });
};

