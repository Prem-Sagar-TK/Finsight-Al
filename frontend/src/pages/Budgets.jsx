import React, { useState, useMemo, useEffect, useCallback } from 'react';
import api from '../utils/api';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Education', 'Utilities', 'Other'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const CAT_ICONS = { Food: '🍔', Transport: '🚗', Shopping: '🛍️', Entertainment: '🎮', Health: '💊', Education: '📚', Utilities: '💡', Other: '📦' };

const now = new Date();
const CURRENT_MONTH = now.getMonth(); // 0-indexed to match backend
const CURRENT_YEAR  = now.getFullYear();

/* ── Budget Modal ──────────────────────────────────────────────────── */
const BudgetModal = ({ existing, category, onSave, onClose, saving }) => {
  const [limit, setLimit] = useState(existing ? String(existing.limit) : '');

  const handleSave = () => {
    const val = parseFloat(limit);
    if (isNaN(val) || val <= 0) return;
    onSave(category, val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-900">
            {existing ? 'Edit' : 'Set'} Budget — {category}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">Monthly Limit ($)</label>
          <input
            type="number" min="1" value={limit} onChange={e => setLimit(e.target.value)}
            placeholder="e.g. 500"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#d4ff3f] focus:border-transparent"
            autoFocus
          />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-xl bg-black text-white font-bold text-sm hover:bg-gray-800 transition-colors disabled:opacity-60">
            {saving ? 'Saving…' : 'Save Budget'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Budget Card ───────────────────────────────────────────────────── */
const BudgetCard = ({ category, limit, spent, onEdit, onDelete }) => {
  const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
  const over = spent > limit;
  const near = !over && pct >= 80;
  const statusColor = over ? 'text-red-600' : near ? 'text-yellow-600' : 'text-green-600';
  const barColor = over ? 'bg-red-500' : near ? 'bg-yellow-400' : 'bg-[#d4ff3f]';
  const badge = over ? 'Over Budget' : near ? 'Near Limit' : 'On Track';
  const badgeClass = over ? 'bg-red-100 text-red-600' : near ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700';
  const remaining = limit - spent;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl">
            {CAT_ICONS[category] || '📦'}
          </div>
          <div>
            <h3 className="font-extrabold text-gray-900">{category}</h3>
            <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-lg ${badgeClass}`}>{badge}</span>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={onEdit} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5L21.5 5.5L12 15H9V12L18.5 2.5Z"/></svg>
          </button>
          <button onClick={onDelete} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-100 transition-colors">
            <svg className="w-4 h-4 text-gray-500 hover:text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      </div>

      {/* Amounts */}
      <div className="flex justify-between text-sm">
        <div>
          <p className="text-gray-400 font-medium text-xs">Spent</p>
          <p className="font-extrabold text-gray-900">${spent.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 font-medium text-xs">Used</p>
          <p className={`font-extrabold ${statusColor}`}>{Math.min(pct, 999)}%</p>
        </div>
        <div className="text-right">
          <p className="text-gray-400 font-medium text-xs">{over ? 'Overspent' : 'Remaining'}</p>
          <p className={`font-extrabold ${over ? 'text-red-500' : 'text-gray-900'}`}>
            ${Math.abs(remaining).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════ */
const Budgets = () => {
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH);
  const [selectedYear]  = useState(CURRENT_YEAR);
  const [budgets, setBudgets]   = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [modal, setModal]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [apiError, setApiError] = useState('');

  /* Fetch budgets and transactions from backend */
  const fetchData = useCallback(async () => {
    try {
      const [bRes, tRes] = await Promise.all([
        api.get('/budgets', { params: { month: selectedMonth, year: selectedYear } }),
        api.get('/transactions'),
      ]);
      setBudgets(bRes.data);
      setTransactions(tRes.data);
    } catch (err) {
      setApiError('Failed to load budget data.');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Get actual spending from transactions for selected month/year
  const spendingByCategory = useMemo(() => {
    const map = {};
    transactions
      .filter(t => {
        if (t.type !== 'expense') return false;
        const d = new Date(t.date);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
      })
      .forEach(t => {
        const cat = t.category || 'Other';
        map[cat] = (map[cat] || 0) + Number(t.amount);
      });
    return map;
  }, [transactions, selectedMonth, selectedYear]);

  const handleSave = async (category, limit) => {
    setSaving(true);
    try {
      const { data } = await api.post('/budgets', {
        category,
        limit,
        month: selectedMonth,
        year: selectedYear,
      });
      // setBudget API upserts — refetch to get the latest state
      setBudgets(prev => {
        const idx = prev.findIndex(b => b.category === category);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = data;
          return updated;
        }
        return [...prev, data];
      });
      setModal(null);
    } catch (err) {
      setApiError('Failed to save budget.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/budgets/${id}`);
      setBudgets(prev => prev.filter(b => b._id !== id));
    } catch (err) {
      setApiError('Failed to delete budget.');
    }
  };

  const totalBudgeted = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + (spendingByCategory[b.category] || 0), 0);
  const overBudgetCount = budgets.filter(b => (spendingByCategory[b.category] || 0) > b.limit).length;

  const unbudgetedCategories = CATEGORIES.filter(c => !budgets.find(b => b.category === c));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin w-8 h-8 border-4 border-[#d4ff3f] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-semibold px-5 py-3 rounded-2xl flex items-center justify-between">
          <span>{apiError}</span>
          <button onClick={() => setApiError('')} className="text-red-400 hover:text-red-600 ml-4">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Budget Planner</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Set monthly spending limits per category</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d4ff3f] bg-white"
          >
            {MONTHS.map((m, i) => <option key={m} value={i}>{m} {selectedYear}</option>)}
          </select>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Budgeted', value: `$${totalBudgeted.toLocaleString()}`, icon: '📋', color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'Total Spent', value: `$${totalSpent.toLocaleString()}`, icon: '💸', color: 'text-gray-800', bg: 'bg-gray-50' },
          { label: 'Over Budget', value: `${overBudgetCount} categor${overBudgetCount !== 1 ? 'ies' : 'y'}`, icon: '⚠️', color: overBudgetCount > 0 ? 'text-red-600' : 'text-green-600', bg: overBudgetCount > 0 ? 'bg-red-50' : 'bg-green-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-white`}>
            <span className="text-xl">{s.icon}</span>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mt-2">{s.label}</p>
            <p className={`text-xl font-black mt-0.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Budget cards */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map(b => (
            <BudgetCard
              key={b._id}
              category={b.category}
              limit={b.limit}
              spent={spendingByCategory[b.category] || 0}
              onEdit={() => setModal({ category: b.category, existing: b })}
              onDelete={() => handleDelete(b._id)}
            />
          ))}
        </div>
      )}

      {/* Add budgets for remaining categories */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-extrabold text-gray-900 mb-4">
          {budgets.length === 0 ? 'Set Your Budgets' : 'Add More Categories'}
        </h3>
        {budgets.length === 0 && (
          <p className="text-gray-500 text-sm font-medium mb-4">You haven't set any budgets for {MONTHS[selectedMonth]} {selectedYear} yet. Click a category to get started.</p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {unbudgetedCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setModal({ category: cat, existing: null })}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#d4ff3f] hover:bg-[#d4ff3f]/5 transition-all group"
            >
              <span className="text-2xl">{CAT_ICONS[cat] || '📦'}</span>
              <span className="text-xs font-bold text-gray-500 group-hover:text-gray-900">{cat}</span>
              <span className="text-[10px] font-semibold text-gray-400 group-hover:text-[#999]">+ Set limit</span>
            </button>
          ))}
        </div>
        {unbudgetedCategories.length === 0 && (
          <p className="text-center text-gray-400 text-sm font-medium py-4">All categories have budgets set for this month! 🎉</p>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <BudgetModal
          category={modal.category}
          existing={modal.existing}
          onSave={handleSave}
          onClose={() => setModal(null)}
          saving={saving}
        />
      )}
    </div>
  );
};

export default Budgets;
