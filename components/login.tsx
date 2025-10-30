import React, { useState } from 'react';

import { useAuth } from '../src/context/AuthContext';
import Card from './common/Card';

const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@sdasports.com');
  const [password, setPassword] = useState('password'); // Default for demo
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white">
          SDA Sports Login
        </h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="pt-4">
            <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500">
              Login
            </button>
          </div>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            (Hint: Register a new user or use a seeded admin account)
          </p>
        </form>
      </Card>
    </div>
  );
};

export default Login;