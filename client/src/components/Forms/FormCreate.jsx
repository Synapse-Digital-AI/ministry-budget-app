// src/components/Forms/FormCreate.jsx
// Placeholder component for Phase 3.2
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const FormCreate = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Create New Form</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="mb-6">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Form Builder Coming Soon
          </h2>
          <p className="text-gray-600 mb-6">
            The complete form builder with all 9 sections will be available in Phase 3.2.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-church-primary text-white rounded-lg hover:bg-church-secondary font-medium"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormCreate;

