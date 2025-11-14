// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Common/Header';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-church-green"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Layout Component
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Placeholder routes - will be implemented in next phase */}
          <Route
            path="/forms"
            element={
              <ProtectedRoute>
                <Layout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Forms Management
                    </h2>
                    <p className="text-gray-600">Coming soon - Full form builder</p>
                  </div>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/forms/new"
            element={
              <ProtectedRoute allowedRoles={['ministry_leader', 'admin']}>
                <Layout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Create New Form
                    </h2>
                    <p className="text-gray-600">Form builder coming in Phase 3.2</p>
                  </div>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/forms/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      View Form
                    </h2>
                    <p className="text-gray-600">Form viewer coming in Phase 3.2</p>
                  </div>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/forms/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['ministry_leader', 'admin']}>
                <Layout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Edit Form
                    </h2>
                    <p className="text-gray-600">Form editor coming in Phase 3.2</p>
                  </div>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/forms/:id/approve"
            element={
              <ProtectedRoute allowedRoles={['pillar', 'pastor', 'admin']}>
                <Layout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Approve Form
                    </h2>
                    <p className="text-gray-600">Approval UI coming in Phase 3.2</p>
                  </div>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Admin Panel
                    </h2>
                    <p className="text-gray-600">
                      Ministries & Event Types management coming in Phase 3.2
                    </p>
                  </div>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      User Profile
                    </h2>
                    <p className="text-gray-600">Profile page coming in Phase 3.2</p>
                  </div>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Redirect root to login (will redirect to dashboard if authenticated) */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* 404 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
