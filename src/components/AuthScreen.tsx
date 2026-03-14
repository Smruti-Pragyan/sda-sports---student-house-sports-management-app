import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from './common/Card';
import api from '../api';
import { EyeIcon, EyeOffIcon, SunIcon, MoonIcon, SpinnerIcon, BasketballIcon, CloseIcon } from './Icons'; 
import { type Theme } from '../types'; 

// --- Component for login success ---
const Confetti: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden z-50 pointer-events-none">
    {Array.from({ length: 50 }).map((_, i) => (
      <div 
        key={i} 
        className="confetti-piece" 
        style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 0.5}s, ${Math.random() * 2}s`,
          backgroundColor: ['#f44336', '#2196f3', '#4caf50', '#ffeb3b', '#e91e63', '#9c27b0'][i % 6]
        }} 
      />
    ))}
  </div>
);

// --- Component for background specks ---
const FloatingSpecks: React.FC = () => (
  <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
    {Array.from({ length: 20 }).map((_, i) => {
      const size = Math.random() * 5 + 2; 
      const animationDuration = Math.random() * 10 + 10; 
      const animationDelay = Math.random() * -10; 
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

// --- Component for basketball ---
const BouncingBall: React.FC = () => (
  <div className="absolute -bottom-8 -right-8 w-24 h-24 z-20 [animation:bounce-low_2s_ease-in-out_infinite] text-orange-500 opacity-80">
    <BasketballIcon />
  </div>
);

type UIState = 'splash' | 'landing' | 'login' | 'signup';

interface AuthScreenProps {
  onClose?: () => void;
  initialState?: UIState;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onClose, initialState = 'splash' }) => {
  const [uiState, setUiState] = useState<UIState>(initialState);
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

  // Handle Splash Screen Timer
  useEffect(() => {
    if (uiState === 'splash') {
      const timer = setTimeout(() => {
        setUiState('landing');
      }, 2500); // Show splash for 2.5 seconds
      return () => clearTimeout(timer);
    }
  }, [uiState]);

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
        setUiState('login');
        setLoginStatus('idle');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register. Email might be taken.');
      setLoginStatus('idle');
    }
  };

  const resetForms = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const isLoginView = uiState === 'login';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-600 dark:bg-blue-900 p-4 relative overflow-hidden transition-colors duration-300">
      
      {loginStatus === 'success' && <Confetti />}
      <FloatingSpecks />

      {/* --- SPLASH SCREEN --- */}
      {uiState === 'splash' && (
        <div className="z-50 flex flex-col items-center justify-center animate-fade-in-up">
          <div className="w-28 h-28 text-orange-400 animate-bounce mb-6 filter drop-shadow-lg">
            <BasketballIcon />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white text-center tracking-wider drop-shadow-md">
            Welcome to
            <span className="block text-yellow-400 mt-2 animate-pulse">SDA Sports</span>
          </h1>
          <p className="text-xl text-blue-100 mt-6 font-medium tracking-wide opacity-90">
            Track. Compete. Win Together.
          </p>
        </div>
      )}

      {/* --- LANDING / AUTH VIEWS --- */}
      {uiState !== 'splash' && (
        <>
          {/* Back Button (Only in Login/Signup Views) */}
          {(uiState === 'login' || uiState === 'signup') && (
            <button
                onClick={() => {
                  setUiState('landing');
                  resetForms();
                }}
                className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors backdrop-blur-sm"
            >
                <CloseIcon />
                <span className="font-semibold text-sm">Back</span>
            </button>
          )}

          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
          </div>

          <div className="text-center z-10 [animation:logo-pop-in_0.5s_ease-out_forwards]">
            <img src="/sda-logo.png" alt="SDA Logo" className="w-[72px] h-[72px] mx-auto rounded-full shadow-lg" />
            <h1 className="text-4xl font-bold text-white mt-4 drop-shadow-sm">SDA SPORTS</h1>
          </div>
          
          <Card className="w-full max-w-md z-10 !bg-white dark:!bg-gray-800 shadow-2xl mt-8 relative overflow-hidden">
            
            {(uiState === 'login' || uiState === 'signup') && <BouncingBall />}
            
            {error && <p className="text-red-500 text-center mb-4 text-sm font-medium bg-red-50 dark:bg-red-900/20 py-2 rounded">{error}</p>}
            {success && <p className="text-green-500 text-center mb-4 text-sm font-medium bg-green-50 dark:bg-green-900/20 py-2 rounded">{success}</p>}

            {/* --- LANDING OPTIONS --- */}
            {uiState === 'landing' && (
              <div className="flex flex-col items-center px-2 py-4 animate-fade-in-up">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8 text-center">Get Started</h2>
                
                <button 
                  onClick={() => setUiState('login')} 
                  className="w-full py-3.5 mb-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                  Log In
                </button>
                
                <button 
                  onClick={() => setUiState('signup')} 
                  className="w-full py-3.5 mb-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 font-bold rounded-xl shadow-sm transition-all"
                >
                  Sign Up
                </button>

                <div className="relative w-full my-6 flex items-center justify-center">
                  <div className="absolute border-t border-gray-200 dark:border-gray-600 w-full"></div>
                  <span className="bg-white dark:bg-gray-800 px-4 text-xs font-semibold text-gray-400 relative z-10 uppercase tracking-wider">OR</span>
                </div>

                {onClose && (
                  <button 
                    onClick={onClose} 
                    className="w-full py-3.5 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-950 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-colors border border-transparent dark:border-gray-700"
                  >
                    Explore the App
                  </button>
                )}
              </div>
            )}

            {/* --- LOGIN / SIGNUP FORM --- */}
            {(uiState === 'login' || uiState === 'signup') && (
              <form onSubmit={isLoginView ? handleLogin : handleSignUp} className="space-y-4 animate-fade-in-up">
                <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">
                  {isLoginView ? 'Welcome Back' : 'Create Account'}
                </h2>

                {!isLoginView && (
                  <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Name</label>
                      <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-2.5 mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
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
                    className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-2.5 mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
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
                    className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-2.5 mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 transition-shadow"
                    placeholder="••••••••"
                    disabled={loginStatus === 'loading'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          autoComplete="new-password"
                          className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-2.5 mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 transition-shadow"
                          placeholder="••••••••"
                          disabled={loginStatus === 'loading'}
                      />
                      <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          disabled={loginStatus === 'loading'}
                      >
                          {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                  </div>
                )}
                
                {isLoginView && (
                  <div className="flex items-center justify-between mt-2">
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
                      <div className="ml-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                        Remember Me
                      </div>
                    </label>
                  </div>
                )}

                <div className="pt-6">
                  <button 
                    type="submit" 
                    className="w-full px-4 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex justify-center items-center shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:bg-blue-400 dark:disabled:bg-blue-700 disabled:transform-none disabled:shadow-none"
                    disabled={loginStatus === 'loading'}
                  >
                    {loginStatus === 'loading' ? (
                      <SpinnerIcon />
                    ) : (
                      isLoginView ? 'Log In' : 'Sign Up'
                    )}
                  </button>
                </div>
                
              </form>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default AuthScreen;