/**
 * Phase 1 Day 1 Authentication Stub Middleware
 * Owned by Member 1 to unblock parallel development across team members
 * Injects mock user session; replaced in Phase 2 with production JWT verification
 */

const authenticateStub = (req, res, next) => {
  req.user = {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'test.student@example.edu',
    role: 'student',
    studentProfileId: '00000000-0000-0000-0000-000000000002',
  };
  next();
};

module.exports = authenticateStub;
