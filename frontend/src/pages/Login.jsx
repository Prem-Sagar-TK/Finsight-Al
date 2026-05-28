import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const result = await login(email, password);
    if (result.success) {
      if (result.role === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#eef0f4] flex flex-col items-center justify-center p-4 font-sans">
      <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-black font-semibold mb-8 self-start ml-8">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="19" y1="12" x2="5" y2="12" strokeLinecap="round" /><polyline points="12,19 5,12 12,5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to home
      </Link>

      <div className="bg-white p-10 rounded-3xl shadow-sm w-full max-w-md border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-black p-3 rounded-2xl mb-4">
            <svg className="w-7 h-7 text-[#d4ff3f]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">Sign in to your Intellora account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm font-medium mb-5 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-12 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                placeholder="••••••••" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors focus:outline-none flex items-center justify-center"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.815 0 3.65 3.65m-7.815-3.65a3 3 0 1 1-4.243 4.243m4.243-4.243L10.5 13.5" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-600">
              <input type="checkbox" className="rounded" /> Remember me
            </label>
            <a href="#" className="text-sm font-bold text-black hover:underline" onClick={(e) => { e.preventDefault(); window.location.href = '/forgot-password'; }}>Forgot password?</a>
          </div>
          <button type="submit" disabled={isLoading}
            className="w-full bg-[#d4ff3f] text-black font-extrabold text-base py-4 rounded-xl hover:bg-[#c3ec37] active:bg-[#b8e62e] transition-colors shadow-sm disabled:opacity-60 mt-2">
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm font-medium text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-black font-bold hover:underline">Sign up free</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
