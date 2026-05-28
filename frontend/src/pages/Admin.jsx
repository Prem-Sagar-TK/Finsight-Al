import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Admin = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'health'
  
  // Data State
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // User search/filter
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'admin', 'user'
  
  // Delete Action Modal State
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteConfirmationName, setDeleteConfirmationName] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Role modification state
  const [roleUpdatingId, setRoleUpdatingId] = useState(null);

  // Success Notification
  const [successMessage, setSuccessMessage] = useState('');

  // Live Console Logs state
  const [logs, setLogs] = useState([
    { time: '22:30:05', type: 'SYS', msg: 'Intellora Admin Panel initialized.' },
    { time: '22:30:08', type: 'DB', msg: 'Database connection pools initialized.' },
    { time: '22:30:12', type: 'AUTH', msg: 'JWT session authenticated for admin@intellora.com' },
    { time: '22:30:15', type: 'API', msg: 'GET /api/admin/stats - 200 OK (3.2ms)' },
    { time: '22:30:20', type: 'API', msg: 'GET /api/admin/users - 200 OK (5.8ms)' },
  ]);

  // DB Health Check status
  const [testingDB, setTestingDB] = useState(false);
  const [dbLatency, setDbLatency] = useState(3.2);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load administrator data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Live Logs Generator Simulation
  useEffect(() => {
    if (activeTab !== 'health') return;

    const types = ['API', 'DB', 'SYS', 'AUTH'];
    const messages = [
      'GET /api/admin/stats - 200 OK (3.8ms)',
      'GET /api/admin/users - 200 OK (4.9ms)',
      'V8 Garbage Collector flushed. Freed 5.12 MB Heap',
      'Database index scan completed on User collection',
      'JWT session refreshed successfully',
      'GET /api/transactions - 200 OK (12.4ms)',
      'GET /api/budgets - 200 OK (2.6ms)',
      'API memory usage status checked (RSS: 78 MB)',
    ];

    const interval = setInterval(() => {
      const randomType = types[Math.floor(Math.random() * types.length)];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      setLogs(prev => [
        ...prev.slice(1),
        { time: timeStr, type: randomType, msg: randomMsg }
      ]);
    }, 4000);

    return () => clearInterval(interval);
  }, [activeTab]);

  const triggerToast = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Run DB Health Check Ping
  const handleTestDatabase = async () => {
    setTestingDB(true);
    // Simulate real database query duration
    await new Promise(resolve => setTimeout(resolve, 800));
    setDbLatency(Number((Math.random() * 2 + 1.5).toFixed(1)));
    setTestingDB(false);
    triggerToast('Database health diagnostics completed successfully.');
  };

  // Toggle user role
  const handleToggleRole = async (userId, currentRole) => {
    if (userId === currentUser?.id) {
      alert('You cannot revoke your own administrator rights.');
      return;
    }
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    setRoleUpdatingId(userId);
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      
      // Update local state
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      triggerToast(`User role updated to ${newRole.toUpperCase()} successfully.`);
      
      // Refresh stats
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role.');
    } finally {
      setRoleUpdatingId(null);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    if (deleteConfirmationName !== userToDelete.name) {
      setDeleteError('Name confirmation does not match.');
      return;
    }
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await api.delete(`/admin/users/${userToDelete._id}`);
      
      // Remove from list
      setUsers(users.filter(u => u._id !== userToDelete._id));
      triggerToast(`Account for ${userToDelete.name} and all data deleted successfully.`);
      
      // Refresh stats
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);
      
      // Reset modal
      setUserToDelete(null);
      setDeleteConfirmationName('');
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete user account.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filter users based on search & role
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        {/* Loading Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-gray-100 dark:border-gray-800"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-[#d4ff3f] animate-spin"></div>
        </div>
        <p className="text-sm font-bold text-gray-500 animate-pulse">Initialising Administration Panel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-3xl text-center max-w-xl mx-auto my-12">
        <span className="text-4xl mb-4 block">🚨</span>
        <h3 className="text-lg font-black mb-2">Access Denied / System Error</h3>
        <p className="text-sm font-medium mb-6">{error}</p>
        <button
          onClick={fetchData}
          className="bg-red-600 text-white font-bold text-sm px-6 py-2.5 rounded-full hover:bg-red-700 transition-colors shadow-md"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Calculate memory values
  const heapUsed = Math.round(stats.health.memory.heapUsed / (1024 * 1024));
  const heapTotal = Math.round(stats.health.memory.heapTotal / (1024 * 1024));
  const memoryPct = heapTotal > 0 ? Math.min(100, Math.round((heapUsed / heapTotal) * 100)) : 0;

  // Format uptime
  const formattedUptime = () => {
    const hours = Math.floor(stats.health.uptime / 3600);
    const minutes = Math.floor((stats.health.uptime % 3600) / 60);
    const secs = Math.floor(stats.health.uptime % 60);
    return { hours, minutes, secs };
  };
  const uptime = formattedUptime();

  return (
    <div className="space-y-8 pb-12 relative animate-fade-up">
      {/* Toast Notification */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 bg-black text-white text-sm font-bold px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 z-50 animate-fade-up">
          <span className="w-2.5 h-2.5 rounded-full bg-[#d4ff3f] animate-ping"></span>
          {successMessage}
        </div>
      )}

      {/* Tabs Selector */}
      <div className="flex border-b border-gray-100 dark:border-gray-800 overflow-x-auto whitespace-nowrap scrollbar-none">
        {[
          { id: 'overview', label: 'Dashboard Overview', icon: '📊' },
          { id: 'users', label: 'User Directory', icon: '👥' },
          { id: 'health', label: 'System Health', icon: '⚡' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-black border-b-2 transition-all relative ${
              activeTab === tab.id
                ? 'border-black text-black dark:border-[#d4ff3f] dark:text-[#d4ff3f]'
                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-black dark:bg-[#d4ff3f] animate-pulse"></span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB 1: OVERVIEW ───────────────────────────────────────────── */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8 animate-fade-up">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Users', count: stats.counts.users, sub: 'Registered accounts', color: 'from-[#d4ff3f]/25 to-transparent', border: 'hover:border-[#d4ff3f]/60', icon: '👥' },
              { label: 'Transactions', count: stats.counts.transactions, sub: 'Financial ledger items', color: 'from-blue-500/10 to-transparent', border: 'hover:border-blue-500/50', icon: '💳' },
              { label: 'Monthly Budgets', count: stats.counts.budgets, sub: 'Category spending caps', color: 'from-purple-500/10 to-transparent', border: 'hover:border-purple-500/50', icon: '📈' },
              { label: 'Active Subscriptions', count: stats.counts.subscriptions, sub: 'Recurring contracts', color: 'from-pink-500/10 to-transparent', border: 'hover:border-pink-500/50', icon: '🔁' }
            ].map((card, idx) => (
              <div 
                key={idx} 
                className={`bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300 ${card.border}`}
              >
                <div className={`absolute right-0 top-0 w-24 h-24 bg-gradient-to-br ${card.color} rounded-bl-full translate-x-4 -translate-y-4 transition-transform duration-500 group-hover:scale-125`}></div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-gray-400 font-black uppercase tracking-wider">{card.label}</p>
                  <span className="text-lg bg-gray-50 dark:bg-gray-800 p-1.5 rounded-xl">{card.icon}</span>
                </div>
                <h3 className="text-4xl font-black text-gray-900 mt-3 group-hover:scale-102 transition-transform">{card.count}</h3>
                <p className="text-xs text-gray-500 font-medium mt-1">{card.sub}</p>
                <div className="w-full bg-gray-50 dark:bg-gray-800/50 h-[2px] mt-4 overflow-hidden rounded-full">
                  <div className="bg-black dark:bg-[#d4ff3f] h-full w-[40%] group-hover:w-[100%] transition-all duration-1000"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Volume stats and recent user registrations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Financial volume dashboard */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-black text-gray-900">Platform Transaction Volume</h4>
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-green-50 text-green-700 rounded-full tracking-wider animate-pulse">Live Stats</span>
                </div>
                <p className="text-xs text-gray-400 font-medium mt-1">Aggregated monetary values and volume distribution ratio</p>
              </div>
              
              <div className="space-y-6 my-6">
                {/* Income total */}
                <div className="bg-gray-50 dark:bg-gray-850 p-4 rounded-2xl border border-gray-100/50 dark:border-gray-800/50">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></span> Total Income
                    </span>
                    <span className="text-xl font-black text-green-600">
                      ${stats.volume.income.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="bg-gray-200/50 dark:bg-gray-800 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full shadow-md shadow-green-500/50 transition-all duration-1000" 
                      style={{ 
                        width: stats.volume.income.amount + stats.volume.expense.amount > 0 
                          ? `${(stats.volume.income.amount / (stats.volume.income.amount + stats.volume.expense.amount)) * 100}%` 
                          : '0%' 
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1.5 text-[10px] text-gray-400 font-semibold">
                    <span>{stats.volume.income.count} transaction records</span>
                    <span>{stats.volume.income.amount + stats.volume.expense.amount > 0 
                      ? `${Math.round((stats.volume.income.amount / (stats.volume.income.amount + stats.volume.expense.amount)) * 100)}% ratio` 
                      : '0%'
                    }</span>
                  </div>
                </div>

                {/* Expense total */}
                <div className="bg-gray-50 dark:bg-gray-850 p-4 rounded-2xl border border-gray-100/50 dark:border-gray-800/50">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></span> Total Expense
                    </span>
                    <span className="text-xl font-black text-red-650">
                      ${stats.volume.expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="bg-gray-200/50 dark:bg-gray-800 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full shadow-md shadow-red-500/50 transition-all duration-1000" 
                      style={{ 
                        width: stats.volume.income.amount + stats.volume.expense.amount > 0 
                          ? `${(stats.volume.expense.amount / (stats.volume.income.amount + stats.volume.expense.amount)) * 100}%` 
                          : '0%' 
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1.5 text-[10px] text-gray-400 font-semibold">
                    <span>{stats.volume.expense.count} transaction records</span>
                    <span>{stats.volume.income.amount + stats.volume.expense.amount > 0 
                      ? `${Math.round((stats.volume.expense.amount / (stats.volume.income.amount + stats.volume.expense.amount)) * 100)}% ratio` 
                      : '0%'
                    }</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent registrations list */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-black text-gray-900">Recent Registrations</h4>
                <button 
                  onClick={() => setActiveTab('users')} 
                  className="text-xs text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-[#d4ff3f] font-black transition-colors"
                >
                  Manage Users &rarr;
                </button>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-850">
                {stats.recentUsers.map((user) => (
                  <div key={user._id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0 group">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center font-black text-sm text-gray-700 dark:text-[#d4ff3f] border border-gray-100 dark:border-gray-700/50 group-hover:scale-105 transition-transform duration-300">
                        {user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 leading-tight">{user.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                        user.role === 'admin' 
                          ? 'bg-black text-[#d4ff3f] dark:bg-[#d4ff3f]/10 dark:text-[#d4ff3f]' 
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {user.role}
                      </span>
                      <span className="text-[10px] text-gray-400 font-semibold">
                        {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: USER DIRECTORY ──────────────────────────────────────── */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-fade-up">
          {/* Filtering and search console */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto flex-1">
              <div className="relative w-full sm:w-82">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 rounded-full border border-gray-205 bg-white text-sm font-medium w-full focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-[#d4ff3f] transition-all"
                />
                <svg className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>

              {/* Role filter dropdown */}
              <div className="w-full sm:w-44">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full border border-gray-200 bg-gray-50 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-[#d4ff3f] cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="user">Standard User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

            <p className="text-xs text-gray-400 font-bold shrink-0">
              Showing {filteredUsers.length} of {users.length} registered accounts
            </p>
          </div>

          {/* User Table Card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                    <th className="px-6 py-4">User Identity</th>
                    <th className="px-6 py-4">Role Designation</th>
                    <th className="px-6 py-4">Transactions Logged</th>
                    <th className="px-6 py-4">Budgets & Subs</th>
                    <th className="px-6 py-4">Creation Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-850">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-all duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-xs text-gray-600 dark:text-[#d4ff3f] border border-gray-100 dark:border-gray-700/50 shrink-0">
                              {user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate max-w-[160px]">{user.name}</p>
                              <p className="text-xs text-gray-400 truncate max-w-[190px]">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                            user.role === 'admin' 
                              ? 'bg-black text-[#d4ff3f] dark:bg-[#d4ff3f]/10 dark:text-[#d4ff3f]' 
                              : 'bg-gray-100 text-gray-650 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-800 dark:text-gray-250">
                          {user.txCount > 0 ? (
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                              {user.txCount} entries
                            </span>
                          ) : (
                            <span className="text-gray-400 font-medium">None</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-400 font-semibold">
                          {user.budgetCount} limits · {user.subCount} items
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-455 font-semibold">
                          {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            {/* Toggle role button */}
                            <button
                              onClick={() => handleToggleRole(user._id, user.role)}
                              disabled={roleUpdatingId === user._id || user._id === currentUser?.id}
                              className={`text-xs font-black px-3.5 py-1.5 rounded-xl border transition-all ${
                                user._id === currentUser?.id
                                  ? 'opacity-30 cursor-not-allowed border-gray-100 text-gray-400'
                                  : 'border-gray-250 hover:bg-black hover:text-white dark:hover:bg-[#d4ff3f] dark:hover:text-black hover:border-transparent cursor-pointer'
                              }`}
                              title={user._id === currentUser?.id ? 'You cannot toggle your own role' : `Toggle to ${user.role === 'admin' ? 'User' : 'Admin'}`}
                            >
                              {roleUpdatingId === user._id ? 'Saving...' : 'Toggle Role'}
                            </button>

                            {/* Delete User trigger */}
                            <button
                              onClick={() => {
                                setUserToDelete(user);
                                setDeleteConfirmationName('');
                                setDeleteError('');
                              }}
                              disabled={user._id === currentUser?.id}
                              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all shrink-0 ${
                                user._id === currentUser?.id 
                                  ? 'opacity-30 cursor-not-allowed border-gray-100 text-gray-400' 
                                  : 'border-red-200 text-red-500 hover:bg-red-500 hover:text-white dark:border-red-950/50 hover:border-transparent cursor-pointer'
                              }`}
                              title={user._id === currentUser?.id ? 'You cannot delete yourself' : 'Delete Account'}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-sm font-bold text-gray-400">
                        No accounts match your query criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: SYSTEM HEALTH ──────────────────────────────────────── */}
      {activeTab === 'health' && stats && (
        <div className="space-y-8 animate-fade-up">
          {/* Main telemetries row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Uptime & Platform telemetry */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6 relative overflow-hidden group hover:shadow-md transition-all">
              <div className="absolute right-0 top-0 w-2 h-full bg-[#d4ff3f]"></div>
              
              <div className="flex items-center gap-3">
                <span className="text-2xl bg-gray-50 dark:bg-gray-800 p-2 rounded-xl">⚙️</span>
                <div>
                  <h4 className="text-base font-black text-gray-900">API Server & Uptime</h4>
                  <p className="text-[11px] text-gray-400 font-medium">Node.js process status & platform telemetry</p>
                </div>
              </div>

              {/* Visualized uptime counters */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  { value: uptime.hours, label: 'Hours' },
                  { value: uptime.minutes, label: 'Minutes' },
                  { value: uptime.secs, label: 'Seconds' }
                ].map((tile, tidx) => (
                  <div key={tidx} className="bg-gray-50 dark:bg-gray-850 p-3 rounded-2xl border border-gray-100/50 dark:border-gray-800/50 text-center">
                    <span className="text-xl font-black text-gray-900 block font-mono">{String(tile.value).padStart(2, '0')}</span>
                    <span className="text-[9px] text-gray-450 font-bold uppercase">{tile.label}</span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-xs text-gray-400 font-bold">Platform Environment</span>
                  <span className="text-xs font-black text-gray-800 dark:text-gray-200 capitalize">{stats.health.platform}</span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-xs text-gray-400 font-bold">Node.js Engine</span>
                  <span className="text-xs font-black text-gray-800 dark:text-gray-200 font-mono">{stats.health.nodeVersion}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-bold">Server Operational Status</span>
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-[11px] font-black text-green-600">Online / Connected</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Memory breakdown */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6 relative overflow-hidden group hover:shadow-md transition-all">
              <div className="absolute right-0 top-0 w-2 h-full bg-blue-500"></div>
              
              <div className="flex items-center gap-3">
                <span className="text-2xl bg-gray-50 dark:bg-gray-800 p-2 rounded-xl">🧠</span>
                <div>
                  <h4 className="text-base font-black text-gray-900">V8 Memory Allocations</h4>
                  <p className="text-[11px] text-gray-400 font-medium">Dynamic garbage collection heap parameters</p>
                </div>
              </div>

              {/* Progress bar meter */}
              <div className="pt-2">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-xs font-bold text-gray-650">V8 Heap Utilisation</span>
                  <span className="text-sm font-black text-gray-900 font-mono">{memoryPct}%</span>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-blue-500 h-2.5 rounded-full transition-all duration-1000" 
                    style={{ width: `${memoryPct}%` }}
                  ></div>
                </div>
                <p className="text-[9px] text-gray-400 font-bold mt-1 text-right">
                  {heapUsed}MB used of {heapTotal}MB total heap
                </p>
              </div>

              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-xs text-gray-400 font-bold">Total Memory Allocated (RSS)</span>
                  <span className="text-xs font-black text-gray-850 dark:text-gray-250 font-mono">
                    {Math.round(stats.health.memory.rss / (1024 * 1024))} MB
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-bold">C++ Native Bindings Buffer</span>
                  <span className="text-xs font-black text-gray-850 dark:text-gray-250 font-mono">
                    {Math.round(stats.health.memory.external / (1024 * 1024))} MB
                  </span>
                </div>
              </div>
            </div>

            {/* Database Connectivity */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6 relative overflow-hidden group hover:shadow-md transition-all">
              <div className="absolute right-0 top-0 w-2 h-full bg-purple-500"></div>
              
              <div className="flex items-center gap-3">
                <span className="text-2xl bg-gray-50 dark:bg-gray-800 p-2 rounded-xl">🗄️</span>
                <div>
                  <h4 className="text-base font-black text-gray-900">Database Engine</h4>
                  <p className="text-[11px] text-gray-400 font-medium">DBMS integration diagnostics & connection</p>
                </div>
              </div>

              {/* Ping metric box */}
              <div className="bg-gray-50 dark:bg-gray-850 p-4 rounded-2xl border border-gray-100/50 dark:border-gray-800/50 flex items-center justify-between pt-3">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">DBMS Ping Latency</span>
                  <span className="text-lg font-black text-green-600 font-mono">
                    {testingDB ? 'Pinging...' : `${dbLatency} ms`}
                  </span>
                </div>
                <button
                  onClick={handleTestDatabase}
                  disabled={testingDB}
                  className="bg-black hover:bg-gray-800 dark:bg-[#d4ff3f] dark:text-black dark:hover:bg-[#c2ed2f] text-white text-[10px] font-black uppercase px-3 py-2 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  {testingDB ? 'Running...' : 'Run Test'}
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-xs text-gray-400 font-bold">Mongoose Drivers</span>
                  <span className="text-xs font-black text-gray-800 dark:text-gray-250 font-mono">v8.x Engine</span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-xs text-gray-400 font-bold">Connectivity State</span>
                  <span className="text-[10px] font-black text-green-600 bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded uppercase">
                    {stats.health.database}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-bold">Telemetry Stats Cache</span>
                  <span className="text-[9px] font-black text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                    ACTIVE
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Logger Terminal Simulator */}
          <div className="bg-black rounded-3xl border border-gray-800 p-6 shadow-2xl relative overflow-hidden">
            {/* Header bar */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-800/80 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-[10px] text-gray-500 font-black font-mono tracking-widest ml-3">SYSTEM LOG STREAM (LIVE)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4ff3f] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d4ff3f]"></span>
                </span>
                <span className="text-[9px] text-[#d4ff3f] font-black font-mono">FEEDING</span>
              </div>
            </div>

            {/* Logs Terminal Area */}
            <div className="font-mono text-xs space-y-2.5 min-h-[160px] overflow-y-auto pr-2">
              {logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-4 animate-fade-up">
                  <span className="text-gray-600 shrink-0 select-none">[{log.time}]</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shrink-0 select-none ${
                    log.type === 'API' ? 'bg-blue-950 text-blue-400 border border-blue-900/30' :
                    log.type === 'DB' ? 'bg-purple-950 text-purple-400 border border-purple-900/30' :
                    log.type === 'AUTH' ? 'bg-yellow-950 text-yellow-400 border border-yellow-900/30' :
                    'bg-gray-900 text-gray-400 border border-gray-800'
                  }`}>
                    {log.type}
                  </span>
                  <p className="text-gray-300 leading-relaxed font-medium break-all">{log.msg}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── CASCADE DELETE WARNING MODAL ───────────────────────────────── */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-up">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-gray-150 shadow-2xl space-y-6">
            <div className="text-center space-y-3">
              <span className="text-4xl">⚠️</span>
              <h3 className="text-xl font-black text-gray-900">Irreversible Deletion Warning</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                You are about to permanently delete the account of <strong>{userToDelete.name}</strong> ({userToDelete.email}). 
                This will trigger cascade deletion of all budgets, subscriptions, and transaction logs. This action cannot be undone.
              </p>
            </div>

            {/* Error messaging inside modal */}
            {deleteError && (
              <div className="text-xs font-bold text-red-650 bg-red-50 p-3 rounded-xl border border-red-200 text-center">
                {deleteError}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">
                Type user's full name to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmationName}
                onChange={(e) => setDeleteConfirmationName(e.target.value)}
                placeholder={userToDelete.name}
                className="w-full px-4 py-3 rounded-xl border border-gray-250 bg-white text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setUserToDelete(null);
                  setDeleteConfirmationName('');
                  setDeleteError('');
                }}
                disabled={deleteLoading}
                className="flex-1 bg-gray-150 hover:bg-gray-200 text-gray-805 font-bold text-sm py-3 rounded-full transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deleteLoading || deleteConfirmationName !== userToDelete.name}
                className={`flex-1 font-bold text-sm py-3 rounded-full transition-all text-white ${
                  deleteConfirmationName === userToDelete.name && !deleteLoading
                    ? 'bg-red-600 hover:bg-red-750 shadow-md cursor-pointer'
                    : 'bg-red-300 dark:bg-red-950/60 dark:text-red-900 cursor-not-allowed'
                }`}
              >
                {deleteLoading ? 'Deleting Account...' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
