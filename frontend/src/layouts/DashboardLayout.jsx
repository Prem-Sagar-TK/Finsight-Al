import React, { useState, useRef, useEffect, useMemo } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import AiChat from '../pages/AiChat';
import CurrencySetupModal from '../pages/CurrencySetupModal';

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
    name: 'Reports', path: '/dashboard/reports',
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  },
];

const adminNavItem = {
  name: 'Admin Panel', path: '/dashboard/admin',
  icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
};

/* Page titles per route */
const pageTitles = {
  '/dashboard':                  { title: 'Overview',          sub: (name) => `Welcome back, ${name}!` },
  '/dashboard/transactions':     { title: 'Transactions',      sub: () => 'Manage your income and expenses' },
  '/dashboard/budgets':          { title: 'Budget Planner',    sub: () => 'Set and track your monthly spending limits' },
  '/dashboard/insights':         { title: 'AI Insights',       sub: () => 'Personalised recommendations from AI' },
  '/dashboard/reports':          { title: 'Reports',           sub: () => 'Download & analyse your financial reports' },
  '/dashboard/profile':          { title: 'My Profile',        sub: () => 'Manage your personal information' },
  '/dashboard/settings':         { title: 'Settings',          sub: () => 'Customise your experience' },
  '/dashboard/admin':            { title: 'Admin Panel',       sub: () => 'System health & user management dashboard' },
};

/* Avatar initials helper */
const initials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

/* ── Generate dynamic notifications based on real data ──── */
function generateNotifications() {
  const notifications = [];
  const now = new Date();
  const transactions = JSON.parse(localStorage.getItem('finsight_transactions') || '[]');
  const budgets = JSON.parse(localStorage.getItem('finsight_budgets') || '[]');

  // Budget alerts
  const currentBudgets = budgets.filter(b => b.month === now.getMonth() + 1 && b.year === now.getFullYear());
  const catMap = {};
  transactions
    .filter(t => t.type === 'expense')
    .filter(t => {
      const d = new Date(t.date);
      return d.getMonth() + 1 === now.getMonth() + 1 && d.getFullYear() === now.getFullYear();
    })
    .forEach(t => {
      const cat = t.category || 'Other';
      catMap[cat] = (catMap[cat] || 0) + Number(t.amount);
    });

  currentBudgets.forEach(b => {
    const spent = catMap[b.category] || 0;
    const pct = b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0;
    if (pct >= 100) {
      notifications.push({ id: `budget-over-${b.category}`, icon: '🚨', title: 'Over Budget!', body: `${b.category} is ${pct}% — you've exceeded your limit.`, time: 'Now' });
    } else if (pct >= 80) {
      notifications.push({ id: `budget-near-${b.category}`, icon: '⚠️', title: 'Budget Alert', body: `${b.category} is at ${pct}% of your limit.`, time: 'Now' });
    }
  });

  // Recent transaction
  if (transactions.length > 0) {
    const recent = [...transactions].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))[0];
    notifications.push({
      id: `recent-tx`, icon: recent.type === 'income' ? '💰' : '💳',
      title: recent.type === 'income' ? 'Income Recorded' : 'Expense Recorded',
      body: `${recent.description} — $${Number(recent.amount).toLocaleString()}`,
      time: 'Recent',
    });
  }

  // Savings rate tip
  const totalInc = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const totalExp = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  if (totalInc > 0) {
    const savingsRate = ((totalInc - totalExp) / totalInc * 100).toFixed(0);
    if (savingsRate < 20) {
      notifications.push({ id: 'savings-tip', icon: '💡', title: 'AI Tip', body: `Your savings rate is ${savingsRate}%. Try to save at least 20%.`, time: 'Tip' });
    } else {
      notifications.push({ id: 'savings-good', icon: '🏆', title: 'Great Saving!', body: `You're saving ${savingsRate}% of income — keep it up!`, time: 'Tip' });
    }
  }

  if (notifications.length === 0) {
    notifications.push({ id: 'welcome', icon: '👋', title: 'Welcome!', body: 'Add transactions to get personalised notifications here.', time: 'Now' });
  }

  return notifications;
}

/* ════════════════════════════════════════════════════════════════ */
const DashboardLayout = () => {
  const { currentUser, logout } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const userName   = currentUser?.name?.split(' ')[0] || 'User';
  const userEmail  = currentUser?.email || '';
  const itemsToRender = currentUser?.role === 'admin' ? [adminNavItem] : navItems;

  const [notifOpen,   setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifRead,   setNotifRead]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  // Redirect admins to /dashboard/admin if they attempt to access user pages
  useEffect(() => {
    if (currentUser?.role === 'admin' && location.pathname !== '/dashboard/admin') {
      navigate('/dashboard/admin', { replace: true });
    }
  }, [currentUser, location.pathname, navigate]);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen,  setSearchOpen]  = useState(false);
  const searchRef = useRef(null);

  const notifRef   = useRef(null);
  const profileRef = useRef(null);

  useOutsideClick(notifRef,   () => setNotifOpen(false));
  useOutsideClick(profileRef, () => setProfileOpen(false));
  useOutsideClick(searchRef,  () => setSearchOpen(false));

  const handleLogout = () => { logout(); navigate('/'); };
  const { darkMode, toggleDarkMode } = useTheme();

  // Close mobile sidebar on navigation
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  /* Dynamic notifications */
  const notifications = useMemo(() => generateNotifications(), [location.pathname]);

  /* Search transactions */
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const tx = JSON.parse(localStorage.getItem('finsight_transactions') || '[]');
    const q = searchQuery.toLowerCase();
    return tx
      .filter(t => t.description?.toLowerCase().includes(q) || t.category?.toLowerCase().includes(q) || t.note?.toLowerCase().includes(q))
      .slice(0, 5);
  }, [searchQuery]);

  const page = pageTitles[location.pathname] || { title: 'Dashboard', sub: () => '' };

  return (
    <div className="min-h-screen bg-[#eef0f4] flex font-sans">
      {/* ── Mobile Sidebar Overlay ──────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          {/* Drawer */}
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-[#111] text-white flex flex-col shadow-2xl animate-fade-up">
            {/* Logo */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="bg-[#d4ff3f] rounded-lg p-1.5">
                  <svg className="w-5 h-5 text-black" viewBox="0 0 100 100" fill="none">
                    <path d="M30 75V25H75V40H48V50H65V65H48V75H30Z" fill="currentColor"/>
                    <circle cx="75" cy="75" r="10" fill="currentColor"/>
                  </svg>
                </div>
                <span className="text-lg font-extrabold tracking-tight">FinSight AI</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-3 mb-3">Menu</p>
              {itemsToRender.map((item) => (
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
                <div className="w-9 h-9 rounded-full bg-[#d4ff3f] flex items-center justify-center shrink-0">
                  <span className="text-black text-xs font-black">{initials(currentUser?.name)}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold leading-none truncate">{currentUser?.name || 'User'}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5 truncate">{userEmail}</p>
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
        </div>
      )}

      {/* ── Desktop Sidebar ──────────────────────────────────── */}
      <aside className="hidden md:flex w-64 bg-[#111] text-white flex-col my-4 ml-4 rounded-3xl shadow-xl overflow-hidden">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#d4ff3f] rounded-lg p-1.5">
              <svg className="w-5 h-5 text-black" viewBox="0 0 100 100" fill="none">
                <path d="M30 75V25H75V40H48V50H65V65H48V75H30Z" fill="currentColor"/>
                <circle cx="75" cy="75" r="10" fill="currentColor"/>
              </svg>
            </div>
            <span className="text-lg font-extrabold tracking-tight">FinSight AI</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-3 mb-3">Menu</p>
          {itemsToRender.map((item) => (
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
        <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm"
              aria-label="Open menu"
            >
              <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight">{page.title}</h2>
              <p className="text-xs md:text-sm text-gray-500 font-medium hidden sm:block">{page.sub(userName)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Search */}
            {currentUser?.role !== 'admin' && (
              <div className="relative hidden sm:block" ref={searchRef}>
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                  onFocus={() => setSearchOpen(true)}
                  className="pl-9 pr-4 py-2.5 rounded-full border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#d4ff3f] w-48 lg:w-56 transition-all"
                />
                <svg className="w-4 h-4 absolute left-3 top-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>

                {/* Search results dropdown */}
                {searchOpen && searchQuery.trim() && (
                  <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                    {searchResults.length > 0 ? (
                      <>
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-xs font-black text-gray-400 uppercase tracking-wide">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                          {searchResults.map((tx) => (
                            <button
                              key={tx.id}
                              onClick={() => {
                                setSearchQuery('');
                                setSearchOpen(false);
                                navigate('/dashboard/transactions', { state: { searchPrefill: tx.description } });
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                            >
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm ${tx.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                                {tx.type === 'income' ? '↑' : '↓'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{tx.description}</p>
                                <p className="text-xs text-gray-400">{tx.category} · ${Number(tx.amount).toLocaleString()}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            setSearchOpen(false);
                            navigate('/dashboard/transactions', { state: { searchPrefill: searchQuery } });
                            setSearchQuery('');
                          }}
                          className="w-full px-4 py-3 text-xs font-bold text-center text-gray-400 hover:text-black border-t border-gray-100 transition-colors"
                        >
                          View all in Transactions →
                        </button>
                      </>
                    ) : (
                      <div className="px-4 py-6 text-center">
                        <p className="text-sm font-bold text-gray-400">No results found</p>
                        <p className="text-xs text-gray-300 mt-1">Try a different search term</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

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
                  {currentUser?.role !== 'admin' && (
                    <div className="py-2">
                      {[
                        { icon: '👤', label: 'My Profile',     action: () => navigate('/dashboard/profile') },
                        { icon: '⚙️', label: 'Settings',       action: () => navigate('/dashboard/settings') },
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
                  )}

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
        <main className="flex-1 overflow-auto px-4 md:px-8 pb-20 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* ── Mobile Bottom Navigation ──────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 flex items-center justify-around py-2 px-2 safe-bottom">
        {itemsToRender.slice(0, 6).map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all ${
                isActive ? 'text-black' : 'text-gray-400'
              }`
            }
          >
            {item.icon}
            <span className="text-[9px] font-bold">{item.name.split(' ')[0]}</span>
          </NavLink>
        ))}
      </nav>

      {/* AI Chat floating widget — available on all dashboard pages */}
      <AiChat />

      {/* Currency setup modal — shown once after first login */}
      <CurrencySetupModal />
    </div>
  );
};

export default DashboardLayout;
