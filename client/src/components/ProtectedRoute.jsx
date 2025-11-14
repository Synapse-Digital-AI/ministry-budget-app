// src/components/ProtectedRoute.jsx
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  // Debug: Log auth state (remove in production)
  useEffect(() => {
    if (!loading) {
      console.log('ProtectedRoute - User:', user ? 'Authenticated' : 'Not authenticated', 'Loading:', loading);
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-church-green"></div>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute - Redirecting to login: No user found');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log('ProtectedRoute - Redirecting to dashboard: Insufficient permissions');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;

