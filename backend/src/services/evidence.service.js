const EvidenceRepository = require('../repositories/evidence.repository');
const SkillRepository = require('../repositories/skill.repository');
const FacultyRepository = require('../repositories/faculty.repository');

const VALID_TYPES = [
  'github_repo',
  'live_demo',
  'project',
  'certification',
  'course',
  'assignment',
  'written_work',
  'other',
];

const VALID_STUDENT_STATUSES = ['submitted', 'under_review', 'accepted', 'needs_improvement'];
const VALID_REVIEW_STATUSES = ['accepted', 'needs_improvement'];

function validateUrl(url) {
  if (!url || typeof url !== 'string' || !url.trim()) return null;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error('Only HTTP or HTTPS URLs are permitted');
    }
    return trimmed;
  } catch (err) {
    throw new Error('Invalid URL format. Please provide a valid HTTP or HTTPS link.');
  }
}

const EvidenceService = {
  /**
   * Submit new evidence for a skill.
   */
  async submitEvidence(studentId, { skill_id, title, evidence_type, description, url }) {
    if (!title || !title.trim()) throw new Error('Title is required');
    if (!description || !description.trim()) throw new Error('Description is required');
    if (!VALID_TYPES.includes(evidence_type)) {
      throw new Error(`Invalid evidence type. Expected one of: ${VALID_TYPES.join(', ')}`);
    }

    const skill = await SkillRepository.findById(skill_id);
    if (!skill) throw new Error('Skill not found in catalogue');

    const validatedUrl = validateUrl(url);

    return await EvidenceRepository.create(studentId, {
      skill_id,
      title: title.trim(),
      evidence_type,
      description: description.trim(),
      url: validatedUrl,
    });
  },

  /**
   * Get student's evidence records.
   */
  async getStudentEvidence(studentId, filter = {}) {
    return await EvidenceRepository.findByStudent(studentId, filter);
  },

  /**
   * Update or resubmit evidence after feedback.
   */
  async updateStudentEvidence(studentId, evidenceId, { title, evidence_type, description, url }) {
    const existing = await EvidenceRepository.findById(evidenceId);
    if (!existing) throw new Error('Evidence record not found');
    if (existing.student_id !== studentId) {
      throw new Error('Unauthorized to modify this evidence');
    }

    if (!title || !title.trim()) throw new Error('Title is required');
    if (!description || !description.trim()) throw new Error('Description is required');
    if (evidence_type && !VALID_TYPES.includes(evidence_type)) {
      throw new Error(`Invalid evidence type. Expected one of: ${VALID_TYPES.join(', ')}`);
    }

    const validatedUrl = validateUrl(url);

    const updated = await EvidenceRepository.update(evidenceId, studentId, {
      title: title.trim(),
      evidence_type: evidence_type || existing.evidence_type,
      description: description.trim(),
      url: validatedUrl !== null ? validatedUrl : existing.url,
    });

    return updated;
  },

  /**
   * Delete student evidence.
   */
  async deleteStudentEvidence(studentId, evidenceId) {
    const existing = await EvidenceRepository.findById(evidenceId);
    if (!existing) throw new Error('Evidence record not found');
    if (existing.student_id !== studentId) {
      throw new Error('Unauthorized to delete this evidence');
    }
    if (existing.status === 'accepted') {
      throw new Error('Cannot delete evidence that has already been verified and accepted by faculty');
    }

    return await EvidenceRepository.delete(evidenceId, studentId);
  },

  /**
   * Get faculty evidence review queue.
   */
  async getFacultyQueue(facultyProfileId, isTpo, statusFilter = null) {
    return await EvidenceRepository.findForFacultyQueue({
      facultyProfileId,
      isTpo,
      statusFilter,
    });
  },

  /**
   * Review evidence submission by authorized faculty.
   */
  async reviewEvidence(facultyProfileId, isTpo, evidenceId, { status, faculty_feedback }) {
    if (!VALID_REVIEW_STATUSES.includes(status)) {
      throw new Error(`Invalid review status. Expected 'accepted' or 'needs_improvement'`);
    }

    if (status === 'needs_improvement' && (!faculty_feedback || !faculty_feedback.trim())) {
      throw new Error('Detailed actionable feedback is required when requesting student improvements');
    }

    const evidence = await EvidenceRepository.findById(evidenceId);
    if (!evidence) throw new Error('Evidence submission not found');

    // Scope check: If not TPO, verify student's (batch_year, branch) is within faculty's scope
    if (!isTpo) {
      const hasScope = await FacultyRepository.hasScope(
        facultyProfileId,
        evidence.batch_year,
        evidence.branch
      );
      if (!hasScope) {
        throw new Error('You do not have authorization to review students in this batch and branch');
      }
    }

    return await EvidenceRepository.review(evidenceId, facultyProfileId, {
      status,
      faculty_feedback: faculty_feedback ? faculty_feedback.trim() : null,
    });
  },

  /**
   * Get evidence statistics for a student.
   */
  async getStudentEvidenceStats(studentId) {
    return await EvidenceRepository.getStudentEvidenceStats(studentId);
  },
};

module.exports = EvidenceService;
