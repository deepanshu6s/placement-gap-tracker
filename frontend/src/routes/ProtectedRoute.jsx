import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const ProtectedRoute = ({ allowedRoles = null }) => {
  const { isAuthenticated, accessToken, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    // If user's role does not match the route, navigate to their respective portal
    return <Navigate to={user.role === 'faculty' ? '/faculty' : '/student'} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
