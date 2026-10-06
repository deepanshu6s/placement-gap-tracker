import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { AuthLayout } from '../layouts/AuthLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { StudentLayout } from '../layouts/StudentLayout';
import { DashboardPage as StudentDashboard } from '../pages/student/DashboardPage';
import { FacultyLayout } from '../layouts/FacultyLayout';
import { FacultyDashboardPage as FacultyDashboard } from '../pages/faculty/FacultyDashboardPage';
import { ProtectedRoute } from './ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
    ],
  },
  {
    path: '/student',
    element: <ProtectedRoute />,
    children: [
      {
        element: <StudentLayout />,
        children: [
          {
            index: true,
            element: <StudentDashboard />,
          },
          {
            path: '*',
            element: <StudentDashboard />,
          },
        ],
      },
    ],
  },
  {
    path: '/faculty',
    element: <ProtectedRoute />,
    children: [
      {
        element: <FacultyLayout />,
        children: [
          {
            index: true,
            element: <FacultyDashboard />,
          },
          {
            path: '*',
            element: <FacultyDashboard />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
