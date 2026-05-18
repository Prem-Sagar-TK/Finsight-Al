import React from 'react';
import { Link } from 'react-router-dom';

/* ── Icon helper ─────────────────────────────────────────────────── */
const Svg = ({ d, size = 20, className = '' }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const ARROW_RIGHT    = 'M5 12h14M12 5l7 7-7 7';
const ARROW_UP_RIGHT = 'M7 17 17 7M7 7h10v10';
const CHECK          = 'M20 6 9 17l-5-5';

/* ── Feature row ─────────────────────────────────────────────────── */
const FeatureRow = ({ icon, title, body }) => (
  <div className="flex gap-4 py-5 border-t border-gray-100 group hover:bg-gray-50 -mx-2 px-2 rounded-xl transition-colors cursor-default">
    <div className="w-10 h-10 rounded-xl bg-black text-[#9fe870] flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div>
      <p className="font-bold text-gray-900 mb-0.5 text-sm">{title}</p>
      <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
    </div>
  </div>
);

/* ════════════════════════════════════════════════════════════════ */
const LandingPage = () => (
  <div className="min-h-screen bg-white font-[Inter] text-gray-900 overflow-x-hidden">

    {/* ══ NAVBAR ═══════════════════════════════════════════════════ */}
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 font-black text-xl tracking-tight">
          <div className="bg-black rounded-xl w-9 h-9 flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 text-[#9fe870]" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
            </svg>
          </div>
          <span>FinSight <span className="text-[#9fe870]">AI</span></span>
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center gap-1">
          {['Personal', 'Business', 'Insights'].map((l) => (
            <a key={l} href="#"
              className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-black rounded-xl hover:bg-gray-100 transition-all">
              {l}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link to="/login"
            className="hidden sm:block text-sm font-bold text-gray-600 hover:text-black px-4 py-2 rounded-xl hover:bg-gray-100 transition-all">
            Log in
          </Link>
          <Link to="/register"
            className="bg-[#9fe870] text-black font-bold text-sm px-5 py-2.5 rounded-full hover:bg-[#8fda60] active:scale-95 transition-all shadow-sm flex items-center gap-1.5">
            Sign up <Svg d={ARROW_UP_RIGHT} size={14} />
          </Link>
        </div>
      </div>
    </nav>

    {/* ══ HERO ═════════════════════════════════════════════════════ */}
    <section className="hero-mesh pt-20 pb-0 overflow-hidden relative">
      {/* Background blobs */}
      <div className="absolute top-10 left-1/4 w-72 h-72 bg-white/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-56 h-56 bg-black/5 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-5xl mx-auto text-center px-6 relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-black/10 border border-black/15 rounded-full px-4 py-1.5 text-xs font-bold mb-8 animate-fade-up">
          <span className="w-2 h-2 rounded-full bg-black animate-pulse inline-block" />
          AI-Powered Personal Finance
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.05] mb-6 animate-fade-up animate-delay-100">
          Track your money,<br />grow your wealth
        </h1>

        <p className="text-black/65 text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed font-medium animate-fade-up animate-delay-200">
          AI-powered insights, budget planning, and a real-time financial health score — built for students and young professionals.
        </p>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-4 mb-16 flex-wrap animate-fade-up animate-delay-300">
          <Link to="/register"
            className="bg-black text-white font-bold text-base px-8 py-4 rounded-full hover:bg-gray-800 active:scale-95 transition-all shadow-2xl flex items-center gap-2">
            Get started free <Svg d={ARROW_RIGHT} size={16} className="text-[#9fe870]" />
          </Link>
          <Link to="/login"
            className="bg-white/70 text-black font-bold text-base px-8 py-4 rounded-full hover:bg-white active:scale-95 transition-all shadow-lg border border-black/10">
            Sign in
          </Link>
        </div>
      </div>

      {/* ── Abstract dashboard graphic ── */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-white rounded-t-3xl shadow-2xl overflow-hidden border border-gray-200 border-b-0">
          {/* Browser chrome */}
          <div className="flex items-center gap-3 px-5 pt-4 pb-3 bg-gray-50 border-b border-gray-200">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 max-w-xs mx-auto bg-white rounded-full h-6 flex items-center px-3 gap-2 border border-gray-200">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <div className="h-2 bg-gray-200 rounded flex-1" />
            </div>
          </div>

          {/* App shell */}
          <div className="flex" style={{ height: 340 }}>
            {/* Sidebar — no user data, just nav items */}
            <div className="w-48 bg-[#111] p-4 flex flex-col gap-1 shrink-0">
              <div className="flex items-center gap-2 mb-5 px-2">
                <div className="w-5 h-5 bg-[#9fe870] rounded flex items-center justify-center">
                  <svg className="w-3 h-3 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
                  </svg>
                </div>
                <span className="text-white text-xs font-black">FinSight AI</span>
              </div>
              {[
                { label: 'Dashboard', active: true },
                { label: 'Transactions', active: false },
                { label: 'Budgets', active: false },
                { label: 'AI Insights', active: false },
              ].map((item) => (
                <div key={item.label}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold ${item.active ? 'bg-[#9fe870] text-black' : 'text-gray-500'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${item.active ? 'bg-black' : 'bg-gray-600'}`} />
                  {item.label}
                </div>
              ))}
            </div>

            {/* Main area — abstract colored blocks, no numbers */}
            <div className="flex-1 bg-[#f5f7fa] p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="h-2.5 w-24 bg-gray-200 rounded-full mb-1.5" />
                  <div className="h-4 w-16 bg-gray-300 rounded-full" />
                </div>
                <div className="flex gap-2">
                  <div className="h-7 w-20 bg-white rounded-full border border-gray-200" />
                  <div className="h-7 w-7 rounded-full bg-gray-200" />
                </div>
              </div>

              {/* Stat cards — abstract */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Balance', color: 'bg-white' },
                  { label: 'Income', color: 'bg-[#f0fdf4]' },
                  { label: 'Health Score', color: 'bg-[#111]' },
                ].map((c) => (
                  <div key={c.label} className={`${c.color} rounded-2xl p-3 border border-white/50 shadow-sm`}>
                    <p className={`text-[9px] font-bold mb-2 ${c.color === 'bg-[#111]' ? 'text-gray-500' : 'text-gray-400'}`}>{c.label}</p>
                    <div className={`h-5 w-16 rounded-full ${c.color === 'bg-[#111]' ? 'bg-[#9fe870]/30' : 'bg-gray-200'} mb-1`} />
                    <div className={`h-2 w-10 rounded-full ${c.color === 'bg-[#111]' ? 'bg-white/10' : 'bg-gray-100'}`} />
                  </div>
                ))}
              </div>

              {/* Chart + tip — abstract */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-2 w-20 bg-gray-200 rounded-full" />
                    <div className="h-4 w-10 bg-gray-100 rounded-full" />
                  </div>
                  <div className="flex items-end gap-1 h-14">
                    {[40, 65, 30, 55, 80, 45, 60].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t"
                        style={{ height: `${h}%`, background: i === 4 ? '#9fe870' : '#e5e7eb' }} />
                    ))}
                  </div>
                </div>
                <div className="bg-[#9fe870] rounded-2xl p-3">
                  <div className="flex items-center gap-1 mb-2">
                    <svg className="w-3 h-3 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    <p className="text-[10px] font-black text-black">AI Insight</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-2 w-full bg-black/15 rounded-full" />
                    <div className="h-2 w-4/5 bg-black/15 rounded-full" />
                    <div className="h-2 w-3/5 bg-black/15 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ══ STATS STRIP ══════════════════════════════════════════════ */}
    <section className="py-16 bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {[
          { val: '50K+',   label: 'Active users' },
          { val: '2M+',    label: 'Transactions analysed' },
          { val: '99%',    label: 'Uptime guarantee' },
          { val: '4.8★',   label: 'App store rating' },
        ].map((s) => (
          <div key={s.label}>
            <p className="text-4xl md:text-5xl font-black text-[#9fe870] mb-1">{s.val}</p>
            <p className="text-gray-400 text-sm font-semibold">{s.label}</p>
          </div>
        ))}
      </div>
    </section>

    {/* ══ FEATURE 1 — Spending Analysis ════════════════════════════ */}
    <section className="py-24 border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <span className="inline-block bg-[#9fe870]/20 text-black text-xs font-black px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider">
            AI Spending
          </span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-5 leading-tight">
            Know exactly<br />where your money goes
          </h2>
          <p className="text-gray-500 text-lg mb-6 leading-relaxed">
            Every transaction is auto-categorised by AI. Spot hidden patterns, see monthly trends, and get personalised tips to save more.
          </p>
          <div className="space-y-0 mb-8">
            <FeatureRow
              icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>}
              title="Real-time transaction tracking"
              body="Every spend is captured instantly with smart category detection — no manual tagging needed."
            />
            <FeatureRow
              icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>}
              title="Monthly trend reports"
              body="Visual breakdowns show how your spending has shifted over time — and exactly where to cut back."
            />
            <FeatureRow
              icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 3h18M3 9h18M3 15h18M3 21h18" /></svg>}
              title="CSV import from any bank"
              body="Bulk-upload transactions from any bank in seconds — FinSight handles the parsing automatically."
            />
          </div>
          <Link to="/register"
            className="inline-flex items-center gap-2 bg-black text-white font-bold px-6 py-3.5 rounded-full hover:bg-gray-800 transition-all text-sm shadow-lg">
            Analyse my spending <Svg d={ARROW_RIGHT} size={15} className="text-[#9fe870]" />
          </Link>
        </div>

        {/* Abstract spending card — no fake numbers */}
        <div className="relative">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-6 border border-gray-200 shadow-xl">
            <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
              <div className="flex justify-between items-center mb-5">
                <span className="font-black text-sm text-gray-900">Monthly Overview</span>
                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">This Month</span>
              </div>
              {[
                { cat: 'Housing',     pct: 46, color: '#111' },
                { cat: 'Food & Drinks', pct: 21, color: '#9fe870' },
                { cat: 'Transport',   pct: 8,  color: '#93c5fd' },
                { cat: 'Travel',      pct: 15, color: '#fcd34d' },
                { cat: 'Health',      pct: 10, color: '#86efac' },
              ].map((item) => (
                <div key={item.cat} className="mb-3.5">
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-gray-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ background: item.color }} />
                      {item.cat}
                    </span>
                    <span className="text-gray-400">{item.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-1.5 rounded-full" style={{ width: `${item.pct}%`, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-[#9fe870] rounded-2xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-[#9fe870]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-black text-black mb-0.5">AI Insight</p>
                <p className="text-xs text-black/70 font-semibold leading-relaxed">
                  Your housing spend is your biggest category. Consider ways to reduce it to boost your savings rate.
                </p>
              </div>
            </div>
          </div>
          <div className="absolute -top-4 -right-4 bg-black text-white rounded-2xl px-4 py-2 shadow-xl text-xs font-black">
            ✓ AI Classified
          </div>
        </div>
      </div>
    </section>

    {/* ══ FEATURE 2 — Budget Planner ═══════════════════════════════ */}
    <section className="py-24 bg-[#f9fafb] border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Dark card — abstract progress, no dollar values */}
        <div className="bg-[#111] rounded-3xl p-6 shadow-2xl order-2 lg:order-1">
          <div className="flex items-center justify-between mb-5">
            <p className="text-white font-black">Budget Planner</p>
            <span className="text-xs font-bold text-[#9fe870] bg-[#9fe870]/10 px-3 py-1 rounded-full">This Month</span>
          </div>
          <div className="space-y-3 mb-5">
            {[
              { label: 'Housing',        pct: 80, icon: '🏠', warn: false },
              { label: 'Food & Drinks',  pct: 92, icon: '🍔', warn: true  },
              { label: 'Entertainment',  pct: 60, icon: '🎬', warn: false },
              { label: 'Health',         pct: 25, icon: '💊', warn: false },
              { label: 'Transport',      pct: 50, icon: '🚗', warn: false },
            ].map((b) => {
              const danger = b.pct >= 90;
              const barColor = danger ? '#f87171' : b.pct >= 70 ? '#fbbf24' : '#9fe870';
              return (
                <div key={b.label} className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{b.icon}</span> {b.label}
                    </span>
                    <span className="text-[10px] font-bold" style={{ color: barColor }}>
                      {b.pct}% used
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-1.5 rounded-full" style={{ width: `${b.pct}%`, background: barColor }} />
                  </div>
                  {danger && <p className="text-[9px] text-red-400 font-bold mt-1.5">⚠ Near limit — slow down!</p>}
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
              <p className="text-[10px] text-gray-500 mb-1 font-semibold">Total Budget</p>
              <div className="h-5 w-20 bg-white/10 rounded-full" />
            </div>
            <div className="bg-[#9fe870]/10 rounded-xl p-3 border border-[#9fe870]/20">
              <p className="text-[10px] text-gray-500 mb-1 font-semibold">Remaining</p>
              <div className="h-5 w-16 bg-[#9fe870]/20 rounded-full" />
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <span className="inline-block bg-black text-[#9fe870] text-xs font-black px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider">
            Smart Budgets
          </span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-5 leading-tight">
            Budget smarter,<br />spend with confidence
          </h2>
          <p className="text-gray-500 text-lg mb-6 leading-relaxed">
            Set monthly limits per category and get instant alerts before you overspend. FinSight AI adjusts recommendations based on your history.
          </p>
          <div className="space-y-0 mb-8">
            <FeatureRow
              icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" /></svg>}
              title="Smart budget alerts"
              body="Get push notifications the moment you're approaching any category limit."
            />
            <FeatureRow
              icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>}
              title="Subscription tracker"
              body="FinSight auto-detects recurring charges so you never pay for forgotten subscriptions."
            />
          </div>
          <Link to="/register"
            className="inline-flex items-center gap-2 bg-[#9fe870] text-black font-bold px-6 py-3.5 rounded-full hover:bg-[#8fda60] transition-all text-sm shadow-lg">
            Start budget planning <Svg d={ARROW_RIGHT} size={15} />
          </Link>
        </div>
      </div>
    </section>

    {/* ══ HEALTH SCORE ═════════════════════════════════════════════ */}
    <section className="py-24 border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <span className="inline-block bg-green-100 text-green-800 text-xs font-black px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider">
          Financial Health
        </span>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
          Your personalised<br />Financial Health Score
        </h2>
        <p className="text-gray-500 text-lg mb-12 max-w-lg mx-auto leading-relaxed">
          A single 0–100 score that tells you exactly how healthy your finances are — and what to improve first.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { score: 'Poor',      range: '0–40',   color: '#f87171', bg: '#fef2f2', desc: 'High debt, low savings. Time to take action.' },
            { score: 'Good',      range: '41–75',  color: '#fbbf24', bg: '#fffbeb', desc: "On track, but there's room to improve." },
            { score: 'Excellent', range: '76–100', color: '#22c55e', bg: '#f0fdf4', desc: 'Healthy habits — great financial future ahead.' },
          ].map((s) => (
            <div key={s.score}
              className="rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-shadow"
              style={{ background: s.bg }}>
              <div className="w-20 h-20 rounded-full border-4 mx-auto flex flex-col items-center justify-center mb-4 shadow-inner"
                style={{ borderColor: s.color, background: 'white' }}>
                <span className="text-[10px] font-bold text-gray-400">{s.range}</span>
                <span className="text-sm font-black" style={{ color: s.color }}>{s.score}</span>
              </div>
              <p className="text-sm text-gray-500 font-medium">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ══ TESTIMONIALS ═════════════════════════════════════════════ */}
    <section className="py-24 bg-[#111]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01z" />
                </svg>
              ))}
              <span className="text-gray-400 text-sm font-semibold ml-2">Highly rated</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-6">
              Loved by people<br />who care about money
            </h2>
            <p className="text-gray-400 text-lg font-medium mb-8">
              From college students to professionals — FinSight AI helps real people build better financial habits.
            </p>
            <Link to="/register"
              className="inline-flex items-center gap-2 bg-[#9fe870] text-black font-bold px-6 py-3.5 rounded-full hover:bg-[#8fda60] transition-all text-sm">
              Join them today <Svg d={ARROW_RIGHT} size={15} />
            </Link>
          </div>

          <div className="space-y-4">
            {[
              { q: 'FinSight completely changed how I think about money. The AI insights are genuinely useful and actionable.', a: 'Priya S.', role: 'Student' },
              { q: "The health score gave me a wake-up call. I've saved a lot more this year just by following the weekly tips.", a: 'Rahul M.', role: 'Software Engineer' },
              { q: 'The budget alerts literally stopped me from overspending on dining three months in a row.', a: 'Anjali K.', role: 'Marketing Manager' },
            ].map((rev, i) => (
              <div key={i}
                className={`rounded-2xl p-5 border ${i === 1 ? 'bg-[#9fe870] border-[#9fe870]' : 'bg-white/5 border-white/10'}`}>
                <p className={`text-sm font-semibold leading-relaxed mb-4 ${i === 1 ? 'text-black/80' : 'text-gray-300'}`}>
                  "{rev.q}"
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-black text-xs ${i === 1 ? 'text-black' : 'text-white'}`}>{rev.a}</p>
                    <p className={`text-[10px] font-semibold ${i === 1 ? 'text-black/50' : 'text-gray-600'}`}>{rev.role}</p>
                  </div>
                  <div className="flex">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className={`w-3 h-3 ${i === 1 ? 'text-black/40' : 'text-yellow-400'}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>


    {/* ══ FINAL CTA ════════════════════════════════════════════════ */}
    <section className="hero-mesh py-28 text-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-40 h-40 bg-white/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-56 h-56 bg-black/5 rounded-full blur-2xl" />
      </div>
      <div className="relative z-10 max-w-2xl mx-auto px-6">
        <p className="text-sm font-black uppercase tracking-widest text-black/50 mb-4">Start today</p>
        <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-5 leading-tight">
          Your financial future<br />starts now
        </h2>
        <p className="text-black/65 text-lg mb-10 font-medium">
          Join thousands of people who've taken control of their money with FinSight AI.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register"
            className="bg-black text-white font-bold text-lg px-10 py-4 rounded-full hover:bg-gray-800 active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-2">
            Create free account <Svg d={ARROW_RIGHT} size={18} className="text-[#9fe870]" />
          </Link>
          <Link to="/login"
            className="bg-white/80 text-black font-bold text-lg px-10 py-4 rounded-full hover:bg-white active:scale-95 transition-all shadow-md border border-black/10">
            Sign in
          </Link>
        </div>
      </div>
    </section>

    {/* ══ FOOTER ═══════════════════════════════════════════════════ */}
    <footer className="border-t border-gray-100 py-12 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          <div className="col-span-2">
            <div className="flex items-center gap-2 font-black text-lg mb-3">
              <div className="bg-black rounded-xl w-8 h-8 flex items-center justify-center">
                <svg className="w-4 h-4 text-[#9fe870]" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
                </svg>
              </div>
              FinSight <span className="text-[#9fe870]">AI</span>
            </div>
            <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-xs">
              The smart, AI-powered way to understand and manage your personal finances.
            </p>
          </div>
          {[
            { title: 'Product',  links: ['Features', 'Changelog', 'Roadmap'] },
            { title: 'Company',  links: ['About', 'Blog', 'Careers', 'Press'] },
            { title: 'Legal',    links: ['Privacy', 'Terms', 'Security', 'Cookies'] },
          ].map((col) => (
            <div key={col.title}>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-gray-500 hover:text-black font-medium transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-gray-100 gap-4">
          <p className="text-sm text-gray-400 font-medium">© 2025 FinSight AI. All rights reserved.</p>
          <p className="text-sm text-gray-400 font-medium">Made with ♥ for financial freedom</p>
        </div>
      </div>
    </footer>
  </div>
);

export default LandingPage;
