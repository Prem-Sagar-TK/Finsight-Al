import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CHECK = (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const freeFeatures = [
  'AI spending analysis',
  'Up to 100 transactions / month',
  'Budget planner (3 categories)',
  'Financial health score',
  'CSV import',
];

const proFeatures = [
  'Everything in Free',
  'Unlimited transactions',
  'Unlimited budget categories',
  'AI chat assistant',
  'CSV import & export',
  'Priority support',
  'Advanced analytics',
];

const Billing = () => {
  const [currentPlan] = useState('free'); // 'free' | 'pro'
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'

  const monthlyPrice = 5;
  const annualPrice  = Math.round(monthlyPrice * 12 * 0.8); // 20% off

  return (
    <div className="max-w-3xl space-y-6">
      {/* Current plan banner */}
      <div className={`rounded-3xl p-6 border flex items-center justify-between gap-4 ${
        currentPlan === 'pro' ? 'bg-black border-black text-white' : 'bg-white border-gray-100'
      } shadow-sm`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            currentPlan === 'pro' ? 'bg-[#d4ff3f]' : 'bg-gray-100'
          }`}>
            <svg className="w-6 h-6 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </div>
          <div>
            <p className={`text-xs font-black uppercase tracking-widest ${currentPlan === 'pro' ? 'text-gray-400' : 'text-gray-400'}`}>Current Plan</p>
            <p className={`text-xl font-black ${currentPlan === 'pro' ? 'text-[#d4ff3f]' : 'text-gray-900'}`}>
              {currentPlan === 'pro' ? 'Pro' : 'Free'}
            </p>
          </div>
        </div>
        <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wide ${
          currentPlan === 'pro' ? 'bg-[#d4ff3f] text-black' : 'bg-gray-100 text-gray-600'
        }`}>
          {currentPlan === 'pro' ? 'Active' : 'Free forever'}
        </span>
      </div>

      {/* Billing toggle */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h3 className="text-lg font-black text-gray-900">Upgrade Plan</h3>
          <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
            {['monthly', 'annual'].map((cycle) => (
              <button
                key={cycle}
                onClick={() => setBillingCycle(cycle)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                  billingCycle === cycle ? 'bg-black text-white shadow-sm' : 'text-gray-500'
                }`}
              >
                {cycle}
                {cycle === 'annual' && (
                  <span className="ml-1.5 bg-[#d4ff3f] text-black px-1.5 py-0.5 rounded-full text-[9px] font-black">-20%</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Free */}
          <div className={`rounded-2xl border-2 p-6 ${currentPlan === 'free' ? 'border-black' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">Free</p>
              {currentPlan === 'free' && (
                <span className="bg-black text-white text-[10px] font-black px-2 py-1 rounded-full uppercase">Current</span>
              )}
            </div>
            <p className="text-4xl font-black text-gray-900 mb-1">$0 <span className="text-gray-400 text-lg font-semibold">/ mo</span></p>
            <p className="text-gray-400 text-xs font-medium mb-5">Forever free</p>
            <ul className="space-y-3 mb-6">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm font-semibold text-gray-700">
                  <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 shrink-0">{CHECK}</span>
                  {f}
                </li>
              ))}
            </ul>
            <button disabled className="w-full bg-gray-100 text-gray-400 font-bold text-sm py-3 rounded-full cursor-not-allowed">
              Current Plan
            </button>
          </div>

          {/* Pro */}
          <div className="rounded-2xl border-2 border-black bg-black p-6 relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-[#d4ff3f] text-black text-[10px] font-black px-2 py-1 rounded-full uppercase">
              Popular
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Pro</p>
            <p className="text-4xl font-black text-white mb-1">
              ${billingCycle === 'annual' ? Math.round(annualPrice / 12) : monthlyPrice}{' '}
              <span className="text-gray-500 text-lg font-semibold">/ mo</span>
            </p>
            {billingCycle === 'annual' && (
              <p className="text-[#d4ff3f] text-xs font-bold mb-0.5">${annualPrice} billed annually</p>
            )}
            <p className="text-gray-500 text-xs font-medium mb-5">Cancel any time</p>
            <ul className="space-y-3 mb-6">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm font-semibold text-gray-300">
                  <span className="w-5 h-5 bg-[#d4ff3f] rounded-full flex items-center justify-center text-black shrink-0">{CHECK}</span>
                  {f}
                </li>
              ))}
            </ul>
            <button className="w-full bg-[#d4ff3f] text-black font-bold text-sm py-3 rounded-full hover:bg-[#c3ec37] transition-colors">
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>

      {/* Billing history */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <h3 className="text-lg font-black text-gray-900 mb-5">Billing History</h3>
        <div className="text-center py-10">
          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm font-bold text-gray-500">No invoices yet</p>
          <p className="text-xs text-gray-400 font-medium mt-1">Invoices will appear here after your first payment</p>
        </div>
      </div>
    </div>
  );
};

export default Billing;
