// src/components/Forms/FormsList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formsService } from '../../services/forms';
import Header from '../Common/Header';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus, 
  List, 
  LayoutGrid,
  Eye,
  Edit,
  Calendar,
  User
} from 'lucide-react';

const StatusBadge = ({ status }) => {
  const badges = {
    draft: { label: 'Draft', className: 'badge-draft', icon: FileText },
    pending_pillar: { label: 'Pending Pillar', className: 'badge-pending', icon: Clock },
    pending_pastor: { label: 'Pending Pastor', className: 'badge-pending', icon: Clock },
    approved: { label: 'Approved', className: 'badge-approved', icon: CheckCircle },
    rejected: { label: 'Rejected', className: 'badge-rejected', icon: XCircle },
  };

  const badge = badges[status] || badges.draft;
  const Icon = badge.icon;

  return (
    <span className={`badge ${badge.className}`}>
      <Icon size={14} /> {badge.label}
    </span>
  );
};

const FormsList = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'list' or 'grid'
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      setLoading(true);
      const data = await formsService.getForms();
      setForms(data);
    } catch (error) {
      console.error('Error loading forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const canEdit = (form) => {
    if (user.role === 'admin') return true;
    if (user.role === 'ministry_leader' && form.status === 'draft') return true;
    return false;
  };

  const needsMyApproval = (form) => {
    if (user.role === 'pillar' && form.status === 'pending_pillar') return true;
    if (user.role === 'pastor' && form.status === 'pending_pastor') return true;
    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-church-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading forms...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Forms</h1>
            <p className="text-gray-600 mt-1">
              View and manage all ministry budget forms
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 flex">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list'
                    ? 'bg-church-primary text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="List View"
              >
                <List size={20} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid'
                    ? 'bg-church-primary text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Grid View"
              >
                <LayoutGrid size={20} />
              </button>
            </div>

            {/* New Form Button */}
            {(user.role === 'ministry_leader' || user.role === 'admin') && (
              <button
                onClick={() => navigate('/forms/create')}
                className="px-4 py-2 bg-church-primary text-white rounded-lg hover:bg-church-secondary font-medium flex items-center gap-2"
              >
                <Plus size={20} />
                <span>New Form</span>
              </button>
            )}
          </div>
        </div>

        {/* Forms Display */}
        {forms.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No forms found</p>
            {(user.role === 'ministry_leader' || user.role === 'admin') && (
              <button
                onClick={() => navigate('/forms/create')}
                className="px-6 py-3 bg-church-primary text-white rounded-lg hover:bg-church-secondary font-medium flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Create New Form</span>
              </button>
            )}
          </div>
        ) : viewMode === 'list' ? (
          // List View
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Form #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ministry
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Leader
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Created
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {forms.map((form) => (
                    <tr
                      key={form.id}
                      className={`${
                        needsMyApproval(form) ? 'bg-yellow-50' : ''
                      } hover:bg-gray-50 transition-colors`}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {form.form_number}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {form.ministry_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {form.leader_name}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={form.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(form.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/forms/${form.id}/view`)}
                            className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                          >
                            <Eye size={16} />
                            <span>View</span>
                          </button>
                          {canEdit(form) && (
                            <button
                              onClick={() => navigate(`/forms/${form.id}/edit`)}
                              className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Edit size={16} />
                              <span>Edit</span>
                            </button>
                          )}
                          {needsMyApproval(form) && (
                            <button
                              onClick={() => navigate(`/forms/${form.id}/approve`)}
                              className="flex items-center gap-1 px-3 py-1 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                            >
                              <CheckCircle size={16} />
                              <span>Review</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <div
                key={form.id}
                className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${
                  needsMyApproval(form) ? 'border-yellow-400 border-2' : ''
                }`}
              >
                <div className="p-6">
                  {/* Form Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {form.ministry_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Form #{form.form_number}
                      </p>
                    </div>
                    <StatusBadge status={form.status} />
                  </div>

                  {/* Form Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <User size={16} className="mr-2" />
                      <span>{form.leader_name}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar size={16} className="mr-2" />
                      <span>{new Date(form.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => navigate(`/forms/${form.id}/view`)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Eye size={16} />
                      <span>View</span>
                    </button>
                    {canEdit(form) && (
                      <button
                        onClick={() => navigate(`/forms/${form.id}/edit`)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                        <span>Edit</span>
                      </button>
                    )}
                    {needsMyApproval(form) && (
                      <button
                        onClick={() => navigate(`/forms/${form.id}/approve`)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                      >
                        <CheckCircle size={16} />
                        <span>Review</span>
                      </button>
                    )}
                  </div>

                  {needsMyApproval(form) && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800 text-center font-medium">
                      Requires Your Approval
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Forms Count */}
        {forms.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-600">
            Showing {forms.length} form{forms.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormsList;

