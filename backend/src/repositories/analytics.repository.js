const { query } = require('../config/db');

/**
 * Analytics Repository
 * All queries return aggregate-level, privacy-safe data.
 * No individual student identifiers are exposed in aggregate endpoints.
 *
 * Calculation rules:
 * - Baseline coverage: students with ≥1 self-reported baseline / total students in scope.
 * - Assessment coverage: students with ≥1 diagnostic skill score / total in scope.
 * - Self-reported gap: proficiency_level below role's required_level (by mapping).
 * - Missing data is counted separately and NOT treated as a gap.
 */

const AnalyticsRepository = {

  /**
   * Get high-level overview metrics for a faculty scope.
   * For non-TPO faculty: batch_year + branch required.
   * For TPO: pass null to get campus-wide stats.
   */
  async getOverview(batchYear, branch) {
    const conditions = [];
    const params = [];

    if (batchYear) {
      params.push(batchYear);
      conditions.push(`sp.batch_year = $${params.length}`);
    }
    if (branch) {
      params.push(branch);
      conditions.push(`sp.branch = $${params.length}`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await query(
      `SELECT
         COUNT(DISTINCT sp.id)                                                                 AS total_students,
         COUNT(DISTINCT sp.id) FILTER (WHERE sp.target_role_id IS NOT NULL)                   AS students_with_role,
         COUNT(DISTINCT b.student_id)                                                          AS students_with_baseline,
         COUNT(DISTINCT sss.student_id)                                                        AS students_with_assessment,
         COALESCE(SUM(CASE WHEN tp.status = 'completed' THEN 1 ELSE 0 END), 0)               AS total_tasks_completed,
         COUNT(DISTINCT se_pending.id)                                                          AS evidence_pending_review,
         COUNT(DISTINCT se_revision.id)                                                         AS evidence_needs_revision,
         AVG(rs.score) FILTER (WHERE rs.score IS NOT NULL)                                    AS avg_readiness_score
       FROM student_profiles sp
       LEFT JOIN student_skill_baselines b     ON b.student_id = sp.id
       LEFT JOIN student_skill_scores sss      ON sss.student_id = sp.id
       LEFT JOIN student_task_progress tp      ON tp.student_id = sp.id
       LEFT JOIN student_evidence se_pending   ON se_pending.student_id = sp.id
                                              AND se_pending.status IN ('submitted', 'under_review')
       LEFT JOIN student_evidence se_revision  ON se_revision.student_id = sp.id
                                              AND se_revision.status = 'needs_improvement'
       LEFT JOIN readiness_scores rs           ON rs.student_id = sp.id
                                              AND rs.role_id = sp.target_role_id
       ${where}`,
      params
    );

    const row = result.rows[0];
    return {
      total_students:            parseInt(row.total_students, 10)            || 0,
      students_with_role:        parseInt(row.students_with_role, 10)        || 0,
      students_without_role:     (parseInt(row.total_students, 10) || 0) - (parseInt(row.students_with_role, 10) || 0),
      students_with_baseline:    parseInt(row.students_with_baseline, 10)    || 0,
      students_with_assessment:  parseInt(row.students_with_assessment, 10)  || 0,
      total_tasks_completed:     parseInt(row.total_tasks_completed, 10)     || 0,
      evidence_pending_review:   parseInt(row.evidence_pending_review, 10)   || 0,
      evidence_needs_revision:   parseInt(row.evidence_needs_revision, 10)   || 0,
      avg_readiness_score:       row.avg_readiness_score !== null ? parseFloat(row.avg_readiness_score) : null,
    };
  },

  /**
   * Role distribution: how many students are targeting each career role.
   * Counts each student once using their current target_role_id.
   * Students with no role are counted under null.
   */
  async getRoleDistribution(batchYear, branch) {
    const conditions = [];
    const params = [];

    if (batchYear) {
      params.push(batchYear);
      conditions.push(`sp.batch_year = $${params.length}`);
    }
    if (branch) {
      params.push(branch);
      conditions.push(`sp.branch = $${params.length}`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await query(
      `SELECT
         cr.id                                AS role_id,
         COALESCE(cr.name, 'No Role Selected') AS role_name,
         COUNT(sp.id)                          AS student_count,
         AVG(rs.score)                         AS avg_readiness
       FROM student_profiles sp
       LEFT JOIN career_roles cr ON sp.target_role_id = cr.id
       LEFT JOIN readiness_scores rs ON rs.student_id = sp.id AND rs.role_id = sp.target_role_id
       ${where}
       GROUP BY cr.id, cr.name
       ORDER BY student_count DESC`,
      params
    );

    return result.rows.map(r => ({
      role_id:       r.role_id,
      role_name:     r.role_name,
      student_count: parseInt(r.student_count, 10) || 0,
      avg_readiness: r.avg_readiness !== null ? parseFloat(r.avg_readiness) : null,
    }));
  },

  /**
   * Skill-gap heatmap data.
   * For each skill required by any career role in this scope, returns:
   * - Self-reported baseline distribution (beginner/intermediate/proficient/not_sure/no_baseline)
   * - Diagnostic score counts (has_score / no_score) + average
   * - Number of critical gaps in the skill_gaps table (from assessment-based calculation)
   *
   * Results are aggregate only — no individual student data is included.
   */
  async getSkillGapHeatmap(batchYear, branch, roleId) {
    const conditions = ['sp.batch_year IS NOT NULL'];
    const params = [];

    if (batchYear) {
      params.push(batchYear);
      conditions.push(`sp.batch_year = $${params.length}`);
    }
    if (branch) {
      params.push(branch);
      conditions.push(`sp.branch = $${params.length}`);
    }

    const studentWhere = `WHERE ${conditions.join(' AND ')}`;

    // Optional role filter on skill requirements
    const roleCondition = roleId ? `AND rsr.role_id = $${params.length + 1}` : '';
    if (roleId) params.push(roleId);

    const result = await query(
      `WITH scoped_students AS (
         SELECT sp.id, sp.target_role_id
         FROM student_profiles sp
         ${studentWhere}
       ),
       scoped_count AS (
         SELECT COUNT(*) AS total FROM scoped_students
       ),
       role_skills AS (
         SELECT DISTINCT
           rsr.skill_id,
           rsr.required_level,
           rsr.role_id,
           cr.name AS role_name
         FROM role_skill_requirements rsr
         JOIN career_roles cr ON cr.id = rsr.role_id
         ${roleId ? `WHERE rsr.role_id = $${params.length}` : ''}
       )
       SELECT
         rs_def.skill_id,
         s.name                                       AS skill_name,
         s.category                                   AS skill_category,
         rs_def.required_level,
         rs_def.role_id,
         rs_def.role_name,
         scoped_count.total                           AS cohort_size,

         -- Self-reported baseline distribution
         COUNT(b.id) FILTER (WHERE b.proficiency_level = 'beginner')       AS baseline_beginner,
         COUNT(b.id) FILTER (WHERE b.proficiency_level = 'intermediate')    AS baseline_intermediate,
         COUNT(b.id) FILTER (WHERE b.proficiency_level = 'proficient')      AS baseline_proficient,
         COUNT(b.id) FILTER (WHERE b.proficiency_level = 'not_sure')        AS baseline_not_sure,
         (scoped_count.total - COUNT(DISTINCT b_any.student_id))            AS baseline_missing,

         -- Diagnostic assessment evidence
         COUNT(DISTINCT sss.student_id) FILTER (WHERE sss.skill_id = rs_def.skill_id) AS has_assessment,
         AVG(sss.current_score) FILTER (WHERE sss.skill_id = rs_def.skill_id)         AS avg_diagnostic_score,

         -- Skill gap records (from placement gap calculation)
         COUNT(sg.id) FILTER (WHERE sg.gap_category = 'critical')           AS gap_critical,
         COUNT(sg.id) FILTER (WHERE sg.gap_category = 'medium')             AS gap_medium,
         COUNT(sg.id) FILTER (WHERE sg.gap_category = 'small')              AS gap_small

       FROM role_skills rs_def
       JOIN skills s ON s.id = rs_def.skill_id
       CROSS JOIN scoped_count

       LEFT JOIN student_skill_baselines b
         ON b.skill_id = rs_def.skill_id
         AND b.student_id IN (SELECT id FROM scoped_students)

       LEFT JOIN student_skill_baselines b_any
         ON b_any.skill_id = rs_def.skill_id
         AND b_any.student_id IN (SELECT id FROM scoped_students)

       LEFT JOIN student_skill_scores sss
         ON sss.skill_id = rs_def.skill_id
         AND sss.student_id IN (SELECT id FROM scoped_students)

       LEFT JOIN skill_gaps sg
         ON sg.skill_id = rs_def.skill_id
         AND sg.student_id IN (SELECT id FROM scoped_students)
         AND sg.role_id = rs_def.role_id

       GROUP BY rs_def.skill_id, s.name, s.category, rs_def.required_level, rs_def.role_id, rs_def.role_name, scoped_count.total
       ORDER BY gap_critical DESC, baseline_beginner DESC, s.name`,
      params
    );

    return result.rows.map(r => ({
      skill_id:              r.skill_id,
      skill_name:            r.skill_name,
      skill_category:        r.skill_category,
      required_level:        r.required_level,
      role_id:               r.role_id,
      role_name:             r.role_name,
      cohort_size:           parseInt(r.cohort_size, 10) || 0,

      // Self-reported
      baseline_beginner:     parseInt(r.baseline_beginner, 10)     || 0,
      baseline_intermediate: parseInt(r.baseline_intermediate, 10)  || 0,
      baseline_proficient:   parseInt(r.baseline_proficient, 10)    || 0,
      baseline_not_sure:     parseInt(r.baseline_not_sure, 10)      || 0,
      baseline_missing:      parseInt(r.baseline_missing, 10)       || 0,

      // Diagnostic
      has_assessment:        parseInt(r.has_assessment, 10)         || 0,
      avg_diagnostic_score:  r.avg_diagnostic_score !== null ? parseFloat(r.avg_diagnostic_score) : null,

      // Gaps
      gap_critical:          parseInt(r.gap_critical, 10)           || 0,
      gap_medium:            parseInt(r.gap_medium, 10)             || 0,
      gap_small:             parseInt(r.gap_small, 10)              || 0,
    }));
  },

  /**
   * Students who may need faculty support — privacy-safe indicators only.
   * Returns student-level rows only to faculty (already auth-gated in service layer).
   * Does NOT return passwords, tokens, or unrelated personal fields.
   */
  async getStudentSupportList(facultyProfileId, isTpo, batchYear, branch) {
    const conditions = [];
    const params = [];

    if (!isTpo) {
      params.push(facultyProfileId);
      conditions.push(`EXISTS (
        SELECT 1 FROM faculty_batch_scope fbs
        WHERE fbs.faculty_profile_id = $${params.length}
          AND fbs.batch_year = sp.batch_year
          AND fbs.branch = sp.branch
      )`);
    }

    if (batchYear) {
      params.push(batchYear);
      conditions.push(`sp.batch_year = $${params.length}`);
    }
    if (branch) {
      params.push(branch);
      conditions.push(`sp.branch = $${params.length}`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await query(
      `SELECT
         sp.id,
         sp.full_name,
         sp.roll_number,
         sp.branch,
         sp.batch_year,
         sp.cgpa,
         cr.name                                                           AS target_role_name,
         rs.score                                                           AS readiness_score,
         COUNT(DISTINCT b.skill_id)                                         AS baseline_skills_count,
         COUNT(DISTINCT sg.id) FILTER (WHERE sg.gap_category = 'critical') AS critical_gaps,
         COUNT(DISTINCT tp.id) FILTER (WHERE tp.status = 'completed')      AS tasks_completed,
         COUNT(DISTINCT tp.id) FILTER (WHERE tp.status = 'in_progress')    AS tasks_in_progress,
         COUNT(DISTINCT se_rev.id)                                          AS evidence_revision_pending,
         COUNT(DISTINCT se_pen.id)                                          AS evidence_awaiting_review,
         -- Support indicators (flags)
         CASE WHEN COUNT(DISTINCT b.skill_id) = 0 THEN true ELSE false END AS baseline_pending,
         CASE WHEN rs.score < 50 AND rs.score IS NOT NULL THEN true ELSE false END AS low_readiness
       FROM student_profiles sp
       LEFT JOIN career_roles cr        ON cr.id = sp.target_role_id
       LEFT JOIN readiness_scores rs    ON rs.student_id = sp.id AND rs.role_id = sp.target_role_id
       LEFT JOIN student_skill_baselines b  ON b.student_id = sp.id
       LEFT JOIN skill_gaps sg              ON sg.student_id = sp.id AND sg.role_id = sp.target_role_id
       LEFT JOIN student_task_progress tp   ON tp.student_id = sp.id
       LEFT JOIN student_evidence se_rev    ON se_rev.student_id = sp.id AND se_rev.status = 'needs_improvement'
       LEFT JOIN student_evidence se_pen    ON se_pen.student_id = sp.id AND se_pen.status IN ('submitted', 'under_review')
       ${where}
       GROUP BY sp.id, sp.full_name, sp.roll_number, sp.branch, sp.batch_year, sp.cgpa,
                cr.name, rs.score
       ORDER BY baseline_pending DESC, critical_gaps DESC, sp.full_name`,
      params
    );

    return result.rows.map(r => ({
      id:                       r.id,
      full_name:                r.full_name,
      roll_number:              r.roll_number,
      branch:                   r.branch,
      batch_year:               r.batch_year,
      cgpa:                     r.cgpa,
      target_role_name:         r.target_role_name,
      readiness_score:          r.readiness_score !== null ? parseFloat(r.readiness_score) : null,
      baseline_skills_count:    parseInt(r.baseline_skills_count, 10)    || 0,
      critical_gaps:            parseInt(r.critical_gaps, 10)            || 0,
      tasks_completed:          parseInt(r.tasks_completed, 10)          || 0,
      tasks_in_progress:        parseInt(r.tasks_in_progress, 10)        || 0,
      evidence_revision_pending:parseInt(r.evidence_revision_pending, 10)|| 0,
      evidence_awaiting_review: parseInt(r.evidence_awaiting_review, 10) || 0,
      baseline_pending:         r.baseline_pending,
      low_readiness:            r.low_readiness,
      // Support label generation — neutral language
      support_indicators:       [
        r.baseline_pending         ? 'Baseline pending'        : null,
        r.low_readiness            ? 'Low readiness score'     : null,
        parseInt(r.critical_gaps, 10) > 0
                                   ? `${r.critical_gaps} critical gap(s)` : null,
        parseInt(r.evidence_revision_pending, 10) > 0
                                   ? 'Evidence revision pending': null,
      ].filter(Boolean),
    }));
  },

  /**
   * Actionable insights: automatically derived from data.
   * Only returns suggestions when thresholds are met.
   * Thresholds: beginner_ratio >= 0.5 or missing_ratio >= 0.6.
   */
  async getInsights(batchYear, branch) {
    const heatmap = await AnalyticsRepository.getSkillGapHeatmap(batchYear, branch, null);
    const insights = [];

    for (const skill of heatmap) {
      const total = skill.cohort_size;
      if (total < 3) continue; // Too small for reliable insights

      const beginnerRatio = total > 0 ? skill.baseline_beginner / total : 0;
      const missingRatio  = total > 0 ? skill.baseline_missing  / total : 0;
      const criticalCount = skill.gap_critical;

      if (beginnerRatio >= 0.4) {
        insights.push({
          type:          'beginner_concentration',
          skill_id:      skill.skill_id,
          skill_name:    skill.skill_name,
          role_name:     skill.role_name,
          metric_value:  Math.round(beginnerRatio * 100),
          message:       `${Math.round(beginnerRatio * 100)}% of students in ${skill.role_name} self-report Beginner proficiency in ${skill.skill_name}.`,
          suggestion:    `Consider organising a foundational ${skill.skill_name} workshop or sharing beginner-friendly learning resources.`,
        });
      }

      if (missingRatio >= 0.5) {
        insights.push({
          type:          'low_baseline_coverage',
          skill_id:      skill.skill_id,
          skill_name:    skill.skill_name,
          role_name:     skill.role_name,
          metric_value:  Math.round(missingRatio * 100),
          message:       `${Math.round(missingRatio * 100)}% of students have not completed a baseline for ${skill.skill_name}.`,
          suggestion:    `Encourage students targeting ${skill.role_name} to complete their skill self-assessment for ${skill.skill_name}.`,
        });
      }

      if (criticalCount >= Math.max(2, Math.floor(total * 0.3))) {
        insights.push({
          type:          'critical_gap_cluster',
          skill_id:      skill.skill_id,
          skill_name:    skill.skill_name,
          role_name:     skill.role_name,
          metric_value:  criticalCount,
          message:       `${criticalCount} student(s) have a critical diagnostic gap in ${skill.skill_name} for ${skill.role_name}.`,
          suggestion:    `Diagnostic evidence indicates difficulty in ${skill.skill_name}. Additional assessment or practice sessions may help.`,
        });
      }
    }

    // Deduplicate by skill_id + type
    const seen = new Set();
    return insights.filter(ins => {
      const key = `${ins.type}:${ins.skill_id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 12); // Cap at 12 insights for readability
  },

  /**
   * Validate batch_year and branch parameters.
   * Returns { valid: true } or { valid: false, reason: string }.
   */
  validateParams(batchYear, branch) {
    if (batchYear !== null && batchYear !== undefined) {
      const yr = parseInt(batchYear, 10);
      if (isNaN(yr) || yr < 2020 || yr > 2030) {
        return { valid: false, reason: 'batch_year must be a valid year between 2020 and 2030.' };
      }
    }
    return { valid: true };
  },
};

module.exports = AnalyticsRepository;
