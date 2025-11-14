// src/App.jsx - UPDATED FOR PHASE 3.2
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import FormView from './components/Forms/FormView';
import FormCreate from './components/Forms/FormCreate';
// Phase 3.2 components - uncomment when files are created
// import FormBuilder from './components/Forms/FormBuilder';
// import FormApproval from './components/Forms/FormApproval';

// Root route component that redirects based on auth status
const RootRoute = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-church-green"></div>
      </div>
    );
  }
  
  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Form Routes - Phase 3.2 */}
          <Route
            path="/forms/create"
            element={
              <ProtectedRoute allowedRoles={['ministry_leader', 'admin']}>
                <FormCreate />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/forms/new"
            element={
              <ProtectedRoute allowedRoles={['ministry_leader', 'admin']}>
                <FormCreate />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/forms/:id/view"
            element={
              <ProtectedRoute>
                <FormView />
              </ProtectedRoute>
            }
          />
          
          {/* Other form routes - uncomment when components are created */}
          {/* <Route
            path="/forms/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['ministry_leader', 'admin']}>
                <FormBuilder />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/forms/:id/approve"
            element={
              <ProtectedRoute allowedRoles={['pillar', 'pastor', 'admin']}>
                <FormApproval />
              </ProtectedRoute>
            }
          /> */}

          {/* Admin Routes - Coming in Phase 3.3 */}
          {/* <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          /> */}

          {/* Default Route - redirects based on auth status */}
          <Route path="/" element={<RootRoute />} />
          
          {/* 404 Route - redirect to login if not authenticated */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
