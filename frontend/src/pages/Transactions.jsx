import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import { useCurrency } from '../context/CurrencyContext';

/* ── Constants ────────────────────────────────────────────────── */
const EXPENSE_CATEGORIES = [
  'Housing', 'Food & Drinks', 'Transport', 'Entertainment',
  'Travel', 'Health', 'Shopping', 'Education', 'Utilities', 'Other',
];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Gift', 'Refund', 'Other'];

const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/* ── Category badge ───────────────────────────────────────────── */
const CAT_COLORS = {
  'Housing':       'bg-blue-100 text-blue-700',
  'Food & Drinks': 'bg-orange-100 text-orange-700',
  'Transport':     'bg-purple-100 text-purple-700',
  'Entertainment': 'bg-pink-100 text-pink-700',
  'Travel':        'bg-yellow-100 text-yellow-700',
  'Health':        'bg-green-100 text-green-700',
  'Shopping':      'bg-red-100 text-red-700',
  'Education':     'bg-indigo-100 text-indigo-700',
  'Utilities':     'bg-gray-100 text-gray-700',
  'Salary':        'bg-emerald-100 text-emerald-700',
  'Freelance':     'bg-teal-100 text-teal-700',
  'Investment':    'bg-cyan-100 text-cyan-700',
  'Gift':          'bg-rose-100 text-rose-700',
  'Refund':        'bg-lime-100 text-lime-700',
};
const catCls = (cat) => CAT_COLORS[cat] || 'bg-gray-100 text-gray-600';

/* ── Blank form ───────────────────────────────────────────────── */
const blank = () => ({
  _id: '', type: 'expense', description: '', amount: '',
  category: 'Other', date: new Date().toISOString().slice(0, 10), note: '',
});

/* ─────────────────────────────────────────────────────────────── */
/* Modal                                                           */
/* ─────────────────────────────────────────────────────────────── */
const Modal = ({ form, setForm, onSave, onClose, isEdit, saving }) => {
  const { currency } = useCurrency();
  const cats = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: value,
      ...(name === 'type' ? { category: 'Other' } : {}),
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-gray-100">
          <h3 className="text-lg font-black text-gray-900">
            {isEdit ? 'Edit Transaction' : 'Add Transaction'}
          </h3>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="px-7 py-5 space-y-4">
          {/* Type toggle */}
          <div className="flex gap-2 bg-gray-100 rounded-2xl p-1">
            {['expense', 'income'].map((t) => (
              <button key={t} type="button"
                onClick={() => setForm((f) => ({ ...f, type: t, category: 'Other' }))}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${
                  form.type === t
                    ? t === 'expense' ? 'bg-red-500 text-white shadow-sm' : 'bg-green-500 text-white shadow-sm'
                    : 'text-gray-500'
                }`}
              >
                {t === 'expense' ? '↓ Expense' : '↑ Income'}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Description *</label>
            <input name="description" required value={form.description} onChange={handleChange}
              placeholder="e.g. Netflix subscription"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d4ff3f]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Amount ({currency.symbol}) *</label>
              <input name="amount" type="number" min="0.01" step="0.01" required
                value={form.amount} onChange={handleChange} placeholder="0.00"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d4ff3f]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Date *</label>
              <input name="date" type="date" required value={form.date} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d4ff3f]" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Category</label>
            <select name="category" value={form.category} onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d4ff3f]">
              {cats.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Note (optional)</label>
            <input name="note" value={form.note} onChange={handleChange}
              placeholder="Any additional details…"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d4ff3f]" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 bg-black text-white font-bold text-sm py-3.5 rounded-full hover:bg-gray-800 transition-colors disabled:opacity-60">
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Transaction'}
            </button>
            <button type="button" onClick={onClose}
              className="px-5 bg-gray-100 text-black font-bold text-sm py-3.5 rounded-full hover:bg-gray-200 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────── */
/* Main Transactions page                                          */
/* ─────────────────────────────────────────────────────────────── */
const Transactions = () => {
  const { fmt, currency } = useCurrency();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [modalOpen, setModalOpen]       = useState(false);
  const [form, setForm]                 = useState(blank());
  const [isEdit, setIsEdit]             = useState(false);
  const [search, setSearch]             = useState('');
  const [filterType, setFilterType]     = useState('all');
  const [filterCat, setFilterCat]       = useState('all');
  const [sortBy, setSortBy]             = useState('date');
  const [sortDir, setSortDir]           = useState('desc');
  const [csvError, setCsvError]         = useState('');
  const [deleteId, setDeleteId]         = useState(null);
  const [apiError, setApiError]         = useState('');
  const fileRef = useRef(null);
  const location = useLocation();

  /* Fetch all transactions from backend */
  const fetchTransactions = useCallback(async () => {
    try {
      const { data } = await api.get('/transactions');
      setTransactions(data);
    } catch (err) {
      setApiError('Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  /* Auto-trigger from navigation state */
  useEffect(() => {
    if (location.state?.openAdd) {
      setForm(blank()); setIsEdit(false); setModalOpen(true);
    } else if (location.state?.openCSV) {
      setTimeout(() => fileRef.current?.click(), 100);
    } else if (location.state?.searchPrefill) {
      setSearch(location.state.searchPrefill);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Open add modal */
  const openAdd = () => { setForm(blank()); setIsEdit(false); setModalOpen(true); };

  /* Open edit modal */
  const openEdit = (tx) => {
    setForm({
      _id: tx._id,
      type: tx.type,
      description: tx.description,
      amount: tx.amount,
      category: tx.category,
      date: tx.date?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      note: tx.notes || '',
    });
    setIsEdit(true);
    setModalOpen(true);
  };

  /* Save (add or edit) */
  const handleSave = async () => {
    const amount = parseFloat(form.amount);
    if (!form.description.trim() || isNaN(amount) || amount <= 0) return;
    setSaving(true);
    try {
      if (isEdit) {
        const { data } = await api.put(`/transactions/${form._id}`, {
          amount,
          type: form.type,
          category: form.category,
          description: form.description,
          date: form.date,
          notes: form.note,
        });
        setTransactions((prev) => prev.map((t) => t._id === data._id ? data : t));
      } else {
        const { data } = await api.post('/transactions', {
          amount,
          type: form.type,
          category: form.category,
          description: form.description,
          date: form.date,
          notes: form.note,
        });
        setTransactions((prev) => [data, ...prev]);
      }
      setModalOpen(false);
    } catch (err) {
      setApiError('Failed to save transaction.');
    } finally {
      setSaving(false);
    }
  };

  /* Delete */
  const handleDelete = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions((prev) => prev.filter((t) => t._id !== id));
      setDeleteId(null);
    } catch (err) {
      setApiError('Failed to delete transaction.');
    }
  };

  /* CSV export */
  const handleExport = () => {
    const rows = [['Date', 'Description', 'Type', 'Category', 'Amount', 'Notes']];
    filtered.forEach((t) => {
      rows.push([t.date?.slice(0, 10), t.description, t.type, t.category, t.amount, t.notes || '']);
    });
    const csv = rows.map((r) => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `finsight_transactions_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  /* Filter + sort */
  const allCats = [...new Set(transactions.map((t) => t.category))].sort();

  const filtered = transactions
    .filter((t) => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (filterCat !== 'all' && t.category !== filterCat) return false;
      if (search && !t.description?.toLowerCase().includes(search.toLowerCase()) &&
          !t.category?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      const dir = sortDir === 'desc' ? -1 : 1;
      if (sortBy === 'amount') return dir * (a.amount - b.amount);
      return dir * (new Date(a.date) - new Date(b.date));
    });

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    else { setSortBy(col); setSortDir('desc'); }
  };

  /* Summary stats */
  const totalIncome  = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance      = totalIncome - totalExpense;

  const SortIcon = ({ col }) => (
    <svg className={`w-3 h-3 ml-1 inline transition-transform ${sortBy === col && sortDir === 'asc' ? 'rotate-180' : ''} ${sortBy === col ? 'text-black' : 'text-gray-300'}`}
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin w-8 h-8 border-4 border-[#d4ff3f] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* API error */}
      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-semibold px-5 py-3 rounded-2xl flex items-center justify-between">
          <span>{apiError}</span>
          <button onClick={() => setApiError('')} className="text-red-400 hover:text-red-600 ml-4">✕</button>
        </div>
      )}

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Income',  val: totalIncome,  color: 'text-green-600', bg: 'bg-green-50',  badge: 'INCOME'  },
          { label: 'Total Expenses',val: totalExpense, color: 'text-red-500',   bg: 'bg-red-50',    badge: 'EXPENSE' },
          { label: 'Balance',       val: balance,      color: balance >= 0 ? 'text-gray-900' : 'text-red-500', bg: 'bg-white', badge: 'NET' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-5 border border-gray-100 shadow-sm`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-400">{s.label}</p>
              <span className="text-[9px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{s.badge}</span>
            </div>
            <p className={`text-2xl font-black ${s.color}`}>{fmt(s.val)}</p>
            <p className="text-xs text-gray-400 font-medium mt-1">{transactions.length} transactions</p>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm flex flex-wrap gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <svg className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input type="text" placeholder="Search transactions…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#d4ff3f]" />
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#d4ff3f]">
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          {allCats.length > 0 && (
            <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#d4ff3f]">
              <option value="all">All Categories</option>
              {allCats.map((c) => <option key={c}>{c}</option>)}
            </select>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <input ref={fileRef} type="file" accept=".csv" className="hidden" />

          {transactions.length > 0 && (
            <button onClick={handleExport}
              className="flex items-center gap-2 bg-gray-100 text-black font-bold text-sm px-4 py-2.5 rounded-full hover:bg-gray-200 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export
            </button>
          )}

          <button onClick={openAdd}
            className="flex items-center gap-2 bg-black text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-gray-800 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add
          </button>
        </div>
      </div>

      {/* CSV error */}
      {csvError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-semibold px-5 py-3 rounded-2xl flex items-center justify-between">
          <span>{csvError}</span>
          <button onClick={() => setCsvError('')} className="text-red-400 hover:text-red-600 ml-4">✕</button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            </div>
            <p className="text-sm font-black text-gray-600">{transactions.length === 0 ? 'No transactions yet' : 'No results found'}</p>
            <p className="text-xs text-gray-400 font-medium mt-1 max-w-xs">
              {transactions.length === 0
                ? 'Click "Add" to record your first transaction.'
                : 'Try changing the search or filter settings.'}
            </p>
            {transactions.length === 0 && (
              <button onClick={openAdd}
                className="mt-5 bg-black text-white font-bold text-sm px-6 py-3 rounded-full hover:bg-gray-800 transition-colors">
                Add First Transaction
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[11px] font-black text-gray-400 uppercase tracking-widest">
              <span>Description</span>
              <button onClick={() => toggleSort('date')} className="flex items-center text-left hover:text-black transition-colors">
                Date <SortIcon col="date" />
              </button>
              <span>Category</span>
              <button onClick={() => toggleSort('amount')} className="flex items-center text-left hover:text-black transition-colors">
                Amount <SortIcon col="amount" />
              </button>
              <span />
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-50">
              {filtered.map((tx) => (
                <div key={tx._id}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center hover:bg-gray-50/60 transition-colors group">
                  {/* Description */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base ${
                      tx.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {tx.type === 'income' ? '↑' : '↓'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{tx.description}</p>
                      {tx.notes && <p className="text-xs text-gray-400 font-medium truncate">{tx.notes}</p>}
                    </div>
                  </div>

                  {/* Date */}
                  <p className="text-sm font-semibold text-gray-500">{fmtDate(tx.date)}</p>

                  {/* Category */}
                  <span className={`inline-block text-[10px] font-black px-2.5 py-1 rounded-full w-fit ${catCls(tx.category)}`}>
                    {tx.category}
                  </span>

                  {/* Amount */}
                  <p className={`text-sm font-black ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(tx)}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      title="Edit">
                      <svg className="w-3.5 h-3.5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z" />
                      </svg>
                    </button>
                    <button onClick={() => setDeleteId(tx._id)}
                      className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"
                      title="Delete">
                      <svg className="w-3.5 h-3.5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400 font-semibold">{filtered.length} of {transactions.length} transactions</p>
              {(search || filterType !== 'all' || filterCat !== 'all') && (
                <button
                  onClick={() => { setSearch(''); setFilterType('all'); setFilterCat('all'); }}
                  className="text-xs font-bold text-gray-500 hover:text-black transition-colors">
                  Clear filters
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Add/Edit Modal ── */}
      {modalOpen && (
        <Modal
          form={form} setForm={setForm}
          onSave={handleSave} onClose={() => setModalOpen(false)}
          isEdit={isEdit} saving={saving}
        />
      )}

      {/* ── Delete confirm ── */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              </svg>
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-2">Delete Transaction?</h3>
            <p className="text-sm text-gray-500 font-medium mb-7">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-red-500 text-white font-bold text-sm py-3 rounded-full hover:bg-red-600 transition-colors">
                Delete
              </button>
              <button onClick={() => setDeleteId(null)}
                className="flex-1 bg-gray-100 text-black font-bold text-sm py-3 rounded-full hover:bg-gray-200 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
