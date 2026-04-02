import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AiChat from '../pages/AiChat';

/* ── Close dropdown on outside click ─────────────────────────── */
function useOutsideClick(ref, callback) {
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) callback(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, callback]);
}

const navItems = [
  {
    name: 'Dashboard', path: '/dashboard',
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>,
  },
  {
    name: 'Transactions', path: '/dashboard/transactions',
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
  },
  {
    name: 'Budgets', path: '/dashboard/budgets',
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></svg>,
  },
  {
    name: 'AI Insights', path: '/dashboard/insights',
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg>,
  },
  {
    name: 'Subscriptions', path: '/dashboard/subscriptions',
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
  },
];

/* Page titles per route */
const pageTitles = {
  '/dashboard':                  { title: 'Overview',          sub: (name) => `Welcome back, ${name}!` },
  '/dashboard/transactions':     { title: 'Transactions',      sub: () => 'Manage your income and expenses' },
  '/dashboard/budgets':          { title: 'Budget Planner',    sub: () => 'Set and track your monthly spending limits' },
  '/dashboard/insights':         { title: 'AI Insights',       sub: () => 'Personalised recommendations from AI' },
  '/dashboard/subscriptions':    { title: 'Subscriptions',     sub: () => 'Auto-detected recurring expenses' },
  '/dashboard/profile':          { title: 'My Profile',        sub: () => 'Manage your personal information' },
  '/dashboard/settings':         { title: 'Settings',          sub: () => 'Customise your experience' },
  '/dashboard/billing':          { title: 'Billing & Plan',    sub: () => 'Manage your subscription' },
};

/* Avatar initials helper */
const initials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

/* ════════════════════════════════════════════════════════════════ */
const DashboardLayout = () => {
  const { currentUser, logout } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const userName   = currentUser?.name?.split(' ')[0] || 'User';
  const userEmail  = currentUser?.email || '';

  const [notifOpen,   setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifRead,   setNotifRead]   = useState(false);

  const notifRef   = useRef(null);
  const profileRef = useRef(null);

  useOutsideClick(notifRef,   () => setNotifOpen(false));
  useOutsideClick(profileRef, () => setProfileOpen(false));

  const handleLogout = () => { logout(); navigate('/'); };
  const { darkMode, toggleDarkMode } = useTheme();

  /* Static sample notifications — replace with real data when backend ready */
  const notifications = [
    { id: 1, icon: '💡', title: 'AI Tip',           body: 'You can save more by reducing dining spend.', time: 'Just now' },
    { id: 2, icon: '⚠️', title: 'Budget Alert',      body: 'Food & Drinks is at 92% of your limit.',     time: '2 min ago' },
    { id: 3, icon: '✅', title: 'Transaction Added',  body: 'New transaction was recorded successfully.',  time: '10 min ago' },
  ];

  const page = pageTitles[location.pathname] || { title: 'Dashboard', sub: () => '' };

  return (
    <div className="min-h-screen bg-[#eef0f4] flex font-sans">
      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-64 bg-[#111] text-white flex-col my-4 ml-4 rounded-3xl shadow-xl overflow-hidden">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#d4ff3f] rounded-lg p-1.5">
              <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-lg font-extrabold tracking-tight">FinSight AI</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-3 mb-3">Menu</p>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  isActive ? 'bg-[#d4ff3f] text-black shadow-sm' : 'text-gray-400 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="p-4 m-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#d4ff3f] flex items-center justify-center border-2 border-[#d4ff3f] shrink-0">
              <span className="text-black text-xs font-black">{initials(currentUser?.name)}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold leading-none truncate">{currentUser?.name || 'User'}</p>
              <p className="text-[10px] text-gray-500 mt-0.5 truncate max-w-[120px]">{userEmail}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-sm font-bold text-red-400 hover:text-white hover:bg-red-500 rounded-xl py-2 transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Log Out
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-20 flex items-center justify-between px-8">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{page.title}</h2>
            <p className="text-sm text-gray-500 font-medium">{page.sub(userName)}</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden sm:block">
              <input
                type="text"
                placeholder="Search anything..."
                className="pl-9 pr-4 py-2.5 rounded-full border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#d4ff3f] w-56 transition-all"
              />
              <svg className="w-4 h-4 absolute left-3 top-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:shadow-md transition-all hover:border-[#d4ff3f]"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              ) : (
                <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
              )}
            </button>

            {/* ── Notification Bell ─────────────── */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen((o) => !o); setNotifRead(true); setProfileOpen(false); }}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:shadow-md transition-all hover:border-[#d4ff3f] relative"
                aria-label="Notifications"
              >
                <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {/* Unread badge */}
                {!notifRead && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>

              {/* Notification panel */}
              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-fade-up">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <p className="font-black text-gray-900 text-sm">Notifications</p>
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="text-xs text-gray-400 hover:text-black font-bold transition-colors">
                      Mark all read
                    </button>
                  </div>
                  <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="flex gap-3 px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 text-sm">
                          {n.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-gray-900">{n.title}</p>
                          <p className="text-xs text-gray-500 font-medium leading-relaxed mt-0.5">{n.body}</p>
                          <p className="text-[10px] text-gray-400 font-semibold mt-1">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-5 py-3 border-t border-gray-100 text-center">
                    <button className="text-xs font-bold text-gray-400 hover:text-black transition-colors">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Profile Avatar ────────────────── */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => { setProfileOpen((o) => !o); setNotifOpen(false); }}
                className="w-10 h-10 rounded-full bg-[#d4ff3f] flex items-center justify-center border-2 border-[#d4ff3f] shadow-sm hover:shadow-md cursor-pointer transition-all hover:scale-105"
                aria-label="Profile menu"
              >
                <span className="text-black text-xs font-black">{initials(currentUser?.name)}</span>
              </button>

              {/* Profile dropdown */}
              {profileOpen && (
                <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-fade-up">
                  {/* User info header */}
                  <div className="px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#d4ff3f] flex items-center justify-center shrink-0">
                        <span className="text-black text-sm font-black">{initials(currentUser?.name)}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-sm text-gray-900 truncate">{currentUser?.name || 'User'}</p>
                        <p className="text-[11px] text-gray-400 font-medium truncate">{userEmail}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-2">
                    {[
                      { icon: '👤', label: 'My Profile',     action: () => navigate('/dashboard/profile') },
                      { icon: '⚙️', label: 'Settings',       action: () => navigate('/dashboard/settings') },
                      { icon: '💳', label: 'Billing & Plan', action: () => navigate('/dashboard/billing') },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => { item.action(); setProfileOpen(false); }}
                        className="w-full flex items-center gap-3 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-left"
                      >
                        <span className="text-base">{item.icon}</span>
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-100 py-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16,17 21,12 16,7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto px-8 pb-8">
          <Outlet />
        </main>
      </div>
      {/* AI Chat floating widget — available on all dashboard pages */}
      <AiChat />
    </div>
  );
};

export default DashboardLayout;
