// src/components/Common/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Settings, LayoutDashboard, FileText, Bell } from 'lucide-react';
import { formsService } from '../../services/forms';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Poll for forms and generate notifications
  useEffect(() => {
    if (user && (user.role === 'pillar' || user.role === 'pastor' || user.role === 'ministry_leader')) {
      loadNotifications();
      // Poll every 30 seconds
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notification-container')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const loadNotifications = async () => {
    try {
      const forms = await formsService.getForms();
      const dismissedIds = JSON.parse(localStorage.getItem(`dismissed_notifications_${user.id}`) || '[]');

      let newNotifications = [];

      forms.forEach(form => {
        // Skip if already dismissed
        if (dismissedIds.includes(form.id)) return;

        if (user.role === 'ministry_leader') {
          if (form.status === 'rejected') {
            newNotifications.push({
              id: form.id,
              form_id: form.id,
              title: 'Form Rejected',
              message: `Form #${form.form_number} was rejected.`,
              type: 'rejected',
              created_at: form.rejected_at || form.updated_at
            });
          } else if (form.status === 'approved') {
            // Only show approved notification if not dismissed
            newNotifications.push({
              id: form.id,
              form_id: form.id,
              title: 'Form Approved',
              message: `Form #${form.form_number} has been fully approved!`,
              type: 'approved',
              created_at: form.pastor_approved_at || form.updated_at
            });
          }
        } else if (user.role === 'pillar' && form.status === 'pending_pillar') {
          newNotifications.push({
            id: form.id,
            form_id: form.id,
            title: 'Approval Required',
            message: `Form #${form.form_number} from ${form.ministry_name} needs your approval.`,
            type: 'pending_pillar',
            created_at: form.submitted_at || form.updated_at
          });
        } else if (user.role === 'pastor' && form.status === 'pending_pastor') {
          newNotifications.push({
            id: form.id,
            form_id: form.id,
            title: 'Approval Required',
            message: `Form #${form.form_number} from ${form.ministry_name} needs your approval.`,
            type: 'pending_pastor',
            created_at: form.pillar_approved_at || form.updated_at
          });
        }
      });

      // Sort by date desc
      newNotifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setNotifications(newNotifications);
      setNotificationCount(newNotifications.length);

    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleNotificationItemClick = (notification) => {
    // Add to dismissed list in localStorage
    const dismissedIds = JSON.parse(localStorage.getItem(`dismissed_notifications_${user.id}`) || '[]');
    if (!dismissedIds.includes(notification.id)) {
      dismissedIds.push(notification.id);
      localStorage.setItem(`dismissed_notifications_${user.id}`, JSON.stringify(dismissedIds));
    }

    // Update state
    setNotifications(prev => prev.filter(n => n.id !== notification.id));
    setNotificationCount(prev => Math.max(0, prev - 1));
    setShowNotifications(false);

    // Navigate
    if (notification.type === 'rejected' && user.role === 'ministry_leader') {
      navigate(`/forms/${notification.form_id}/amend`);
    } else {
      navigate(`/forms/${notification.form_id}/view`);
    }
  };

  const handleMarkAllRead = () => {
    const dismissedIds = JSON.parse(localStorage.getItem(`dismissed_notifications_${user.id}`) || '[]');
    const newDismissedIds = [...dismissedIds, ...notifications.map(n => n.id)];
    localStorage.setItem(`dismissed_notifications_${user.id}`, JSON.stringify([...new Set(newDismissedIds)]));

    setNotifications([]);
    setNotificationCount(0);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <Link to="/dashboard" className="flex items-center gap-3">
            <img
              src="/assets/tvc.png"
              alt="The Voice Church"
              className="h-10 w-10 object-contain"
            />
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                The Voice Church
              </h1>
              <p className="text-xs text-gray-600">
                Ministry Budget System
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-gray-700 hover:text-church-green transition-colors"
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/forms"
              className="flex items-center gap-2 text-gray-700 hover:text-church-green transition-colors"
            >
              <FileText size={18} />
              <span>Forms</span>
            </Link>

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="flex items-center gap-2 text-gray-700 hover:text-church-green transition-colors"
              >
                <Settings size={18} />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-600 capitalize">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>

            {/* Notification Bell - Only for pillar, pastor, and ministry_leader */}
            {(user?.role === 'pillar' || user?.role === 'pastor' || user?.role === 'ministry_leader') && (
              <div className="relative notification-container">
                <button
                  onClick={handleNotificationClick}
                  className="relative p-2 text-gray-600 hover:text-church-green hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Bell size={22} />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      {notificationCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <Bell size={32} className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No new notifications</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => handleNotificationItemClick(notification)}
                            className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors bg-blue-50"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2 bg-blue-600" />
                              <div className="flex-1">
                                <h4 className="font-medium text-sm text-gray-900">
                                  {notification.title}
                                </h4>
                                <p className="text-xs text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(notification.created_at).toLocaleDateString()}
                                </p>
                                {notification.type === 'rejected' && (
                                  <button
                                    className="mt-2 px-3 py-1 bg-church-primary text-white text-xs rounded hover:bg-church-secondary transition-colors flex items-center gap-1"
                                  >
                                    <FileText size={12} />
                                    Amend Form
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
