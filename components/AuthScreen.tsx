import React, { useState, useEffect } from 'react';
import { useAuth } from '../src/context/AuthContext';
import Card from './common/Card';
import api from '../src/api';
import { EyeIcon, EyeOffIcon, SdaLogo, SunIcon, MoonIcon, SpinnerIcon, BasketballIcon } from './Icons'; // Import SdaLogo, BasketballIcon
import { type Theme } from '../types'; 

// --- NEW COMPONENT FOR BACKGROUND SPECKS ---
const FloatingSpecks: React.FC = () => (
  <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
    {Array.from({ length: 20 }).map((_, i) => {
      const size = Math.random() * 5 + 2; // size between 2px and 7px
      const animationDuration = Math.random() * 10 + 10; // duration between 10s and 20s
      const animationDelay = Math.random() * -10; // start at a random point
      return (
        <div 
          key={i} 
          className="absolute rounded-full bg-white/30"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `float ${animationDuration}s ease-in-out infinite`,
            animationDelay: `${animationDelay}s`
          }}
        />
      );
    })}
  </div>
);

// --- NEW COMPONENT FOR BASKETBALL ---
const BouncingBall: React.FC = () => (
  <div className="absolute -bottom-8 -right-8 w-24 h-24 z-20 [animation:bounce-low_2s_ease-in-out_infinite]">
    <BasketballIcon />
  </div>
);


const AuthScreen: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login } = useAuth();
  const [loginStatus, setLoginStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [rememberMe, setRememberMe] = useState(false);

  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('sda-sports-theme');
    return (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('sda-sports-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoginStatus('loading');
    try {
      await new Promise(resolve => setTimeout(resolve, 750)); 
      await login(email, password);
      setLoginStatus('success');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login. Check email/password.');
      setLoginStatus('idle');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoginStatus('loading');

    if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoginStatus('idle');
        return;
    }
    if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoginStatus('idle');
        return;
    }

    try {
        await new Promise(resolve => setTimeout(resolve, 750));
        const { data } = await api.post('/auth/register', { name, email, password });
        setSuccess(`Registration successful! You can now log in.`);
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setIsLoginView(true);
        setLoginStatus('idle');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register. Email might be taken.');
      setLoginStatus('idle');
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
    setShowPassword(false);
    setShowConfirmPassword(false);
    setLoginStatus('idle');
  };
  
  return (
    // --- UPDATED MAIN LAYOUT ---
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-600 dark:bg-blue-900 p-4 relative overflow-hidden transition-colors duration-300">
      
      <FloatingSpecks />

      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-white/20 text-white"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
      </div>

      {/* --- ADDED HEADER SECTION --- */}
      <div 
        className="text-center z-10 [animation:logo-pop-in_0.5s_ease-out_forwards]"
        style={{ animationDelay: '0.1s', opacity: 0 }} // Start animation
      >
        <SdaLogo />
        <h1 className="text-4xl font-bold text-white mt-4">SDA SPORTS</h1>
        <p className="text-lg text-white/90 mt-1">
          Track. Compete. Win Together.
        </p>
      </div>
      
      {/* --- UPDATED CARD STYLING --- */}
      <Card 
        className="w-full max-w-md z-10 !bg-white dark:!bg-gray-800 shadow-2xl mt-8 relative overflow-hidden"
      >
        
        {/* The bouncing ball is inside the card, but positioned absolutely */}
        {!isLoginView && <BouncingBall />}
        
        {error && <p className="text-red-500 text-center mb-4 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4 text-sm">{success}</p>}

        <form onSubmit={isLoginView ? handleLogin : handleSignUp} className="space-y-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white">
            {isLoginView ? 'Log In' : 'Sign Up'}
          </h2>

          {!isLoginView && (
             <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John Doe"
                    disabled={loginStatus === 'loading'}
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
              className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="you@example.com"
              disabled={loginStatus === 'loading'}
            />
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={isLoginView ? "current-password" : "new-password"}
              className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500 pr-10"
              placeholder="••••••••"
              disabled={loginStatus === 'loading'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-600 dark:text-gray-400"
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={loginStatus === 'loading'}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {!isLoginView && (
            <div className="relative">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Confirm Password</label>
                <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.targe.value)}
                    required
                    autoComplete="new-password"
                    className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500 pr-10"
                    placeholder="••••••••"
                    disabled={loginStatus === 'loading'}
                />
                 <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-600 dark:text-gray-400"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    disabled={loginStatus === 'loading'}
                >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
            </div>
           )}
           
           {isLoginView && (
            <div className="flex items-center justify-between">
              <label htmlFor="rememberMe" className="flex items-center cursor-pointer select-none">
                <div className="relative">
                  <input 
                    id="rememberMe" 
                    type="checkbox" 
                    className="sr-only" 
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)} 
                    disabled={loginStatus === 'loading'}
                  />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${rememberMe ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${rememberMe ? 'translate-x-full' : ''}`}></div>
                </div>
                <div className="ml-3 text-sm text-gray-600 dark:text-gray-300">
                  Remember Me
                </div>
              </label>
            </div>
           )}

          {/* --- UPDATED BUTTON LAYOUT --- */}
          <div className="pt-4 space-y-3">
            <button 
              type="submit" 
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 flex justify-center items-center h-10 disabled:bg-blue-400 dark:disabled:bg-blue-700"
              disabled={loginStatus === 'loading'}
            >
              {loginStatus === 'loading' ? (
                <SpinnerIcon />
              ) : (
                isLoginView ? 'Log In' : 'Sign Up'
              )}
            </button>

            <button 
              type="button" 
              onClick={toggleView} 
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-white rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
              disabled={loginStatus === 'loading'}
            >
              {isLoginView ? 'Sign Up' : 'Log In'}
            </button>
          </div>
          
        </form>
      </Card>
    </div>
  );
};

export default AuthScreen;