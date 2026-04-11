import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#eef0f4] flex flex-col items-center justify-center p-4 font-sans">
      <Link to="/login" className="flex items-center gap-2 text-gray-500 hover:text-black font-semibold mb-8 self-start ml-8">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="19" y1="12" x2="5" y2="12" strokeLinecap="round" /><polyline points="12,19 5,12 12,5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to login
      </Link>

      <div className="bg-white p-10 rounded-3xl shadow-sm w-full max-w-md border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-black p-3 rounded-2xl mb-4">
            <svg className="w-7 h-7 text-[#d4ff3f]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Reset Password</h1>
          <p className="text-gray-500 mt-2 text-sm font-medium text-center">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {submitted ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900">Check your email</h3>
              <p className="text-gray-500 text-sm font-medium mt-2 leading-relaxed">
                We've sent a password reset link to <strong className="text-gray-900">{email}</strong>.
                Please check your inbox and follow the instructions.
              </p>
            </div>
            <div className="pt-4 space-y-3">
              <button
                onClick={() => { setSubmitted(false); setEmail(''); }}
                className="w-full bg-gray-100 text-black font-bold text-sm py-3.5 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Try another email
              </button>
              <Link to="/login"
                className="block w-full bg-[#d4ff3f] text-black font-extrabold text-base py-3.5 rounded-xl hover:bg-[#c3ec37] transition-colors text-center"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit" disabled={isLoading}
              className="w-full bg-[#d4ff3f] text-black font-extrabold text-base py-4 rounded-xl hover:bg-[#c3ec37] active:bg-[#b8e62e] transition-colors shadow-sm disabled:opacity-60 mt-2"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm font-medium text-gray-500">
          Remember your password?{' '}
          <Link to="/login" className="text-black font-bold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
