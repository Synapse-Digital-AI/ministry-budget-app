// src/components/Auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, pin);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-church-green to-green-700 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Church Header */}
        <div className="bg-white rounded-t-2xl px-8 py-10 text-center">
          <img
            src="/assets/ChurchLogo.png"
            alt="The Voice Church"
            className="w-32 h-32 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            The Voice Church
          </h1>
          <p className="text-sm text-gray-600">
            13910 Laurel Bowie Road, Laurel, MD 20708
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Ministry Budget & Plan System
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-50 rounded-b-2xl px-8 py-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Sign In
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@thevoicechurch.org"
                required
                autoFocus
                className="input"
              />
            </div>

            <div>
              <label htmlFor="pin" className="label">
                PIN (4-6 digits)
              </label>
              <input
                type="password"
                id="pin"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter your PIN"
                maxLength="6"
                pattern="[0-9]*"
                inputMode="numeric"
                required
                className="input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 text-base"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
            <p className="mb-2">Default PIN: <strong>1234</strong></p>
            <p>Need help? Contact Betty Washington</p>
            <a
              href="mailto:bwashington@thevoicechurch.org"
              className="text-church-green hover:underline"
            >
              bwashington@thevoicechurch.org
            </a>
            <p className="text-gray-500 mt-1">(202) 910-4771</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
