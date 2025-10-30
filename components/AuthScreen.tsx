import React, { useState } from 'react';
import { useAuth } from '../src/context/AuthContext';
import Card from './common/Card';
import api from '../src/api';
import { EyeIcon, EyeOffIcon } from './Icons'; // Import the new icons

const AuthScreen: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); // Start empty for better UX
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for confirm password visibility
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login. Check email/password.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
    }
    if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
    }

    try {
        const { data } = await api.post('/auth/register', { name, email, password });
        setSuccess(`Registration successful for ${data.name}! You can now log in.`);
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setIsLoginView(true); // Switch to login view after successful registration
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register. Email might be taken.');
    }
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    setShowPassword(false); // Reset visibility on view change
    setShowConfirmPassword(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white">
          SDA Sports {isLoginView ? 'Login' : 'Sign Up'}
        </h1>
        {error && <p className="text-red-500 text-center mb-4 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4 text-sm">{success}</p>}

        <form onSubmit={isLoginView ? handleLogin : handleSignUp} className="space-y-4">
          {!isLoginView && (
             <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {/* Password Input with Toggle */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={isLoginView ? "current-password" : "new-password"}
              className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500 pr-10" // Added padding-right
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-500 dark:text-gray-400" // Adjusted top margin
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {/* Confirm Password Input with Toggle (Sign Up only) */}
          {!isLoginView && (
            <div className="relative">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Confirm Password</label>
                <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500 pr-10" // Added padding-right
                />
                 <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-500 dark:text-gray-400" // Adjusted top margin
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
            </div>
           )}
          <div className="pt-4">
            <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500">
              {isLoginView ? 'Login' : 'Sign Up'}
            </button>
          </div>
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            {isLoginView ? "Don't have an account? " : "Already have an account? "}
            <button type="button" onClick={toggleView} className="font-medium text-blue-600 hover:text-blue-500">
              {isLoginView ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default AuthScreen;
