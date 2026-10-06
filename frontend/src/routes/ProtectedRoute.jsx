import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * ProtectedRoute Placeholder (Owned by Member 1)
 * Will redirect unauthenticated requests to /login in Phase 2
 */
export const ProtectedRoute = () => {
  // Pass-through in Phase 1 foundation to allow structural inspection
  return <Outlet />;
};
