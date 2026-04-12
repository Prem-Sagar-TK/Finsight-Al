import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const CATEGORIES = ['Streaming', 'Music', 'Cloud', 'Software', 'Gaming', 'News', 'Fitness', 'Other'];
const CAT_ICONS = {
  Streaming: '📺', Music: '🎵', Cloud: '☁️', Software: '💻',
  Gaming: '🎮', News: '📰', Fitness: '💪', Other: '🔔',
};
const CAT_COLORS = {
  Streaming: 'bg-red-100 text-red-700', Music: 'bg-purple-100 text-purple-700',
  Cloud: 'bg-blue-100 text-blue-700', Software: 'bg-indigo-100 text-indigo-700',
  Gaming: 'bg-green-100 text-green-700', News: 'bg-yellow-100 text-yellow-700',
  Fitness: 'bg-orange-100 text-orange-700', Other: 'bg-gray-100 text-gray-700',
};

const getDaysUntil = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const renewal = new Date(dateStr);
  renewal.setHours(0, 0, 0, 0);
  return Math.ceil((renewal - today) / (1000 * 60 * 60 * 24));
};

const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/* ── Modal ─────────────────────────────────────────────────────── */
const SubscriptionModal = ({ form, setForm, onSave, onClose, isEdit, saving }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-gray-100">
          <h3 className="text-lg font-black text-gray-900">{isEdit ? 'Edit Subscription' : 'Add Subscription'}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="px-7 py-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Name *</label>
            <input name="name" required value={form.name} onChange={handleChange}
              placeholder="e.g. Netflix, Spotify"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d4ff3f]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Monthly Cost ($) *</label>
              <input name="cost" type="number" min="0.01" step="0.01" required
                value={form.cost} onChange={handleChange} placeholder="0.00"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d4ff3f]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Renewal Date *</label>
              <input name="renewalDate" type="date" required value={form.renewalDate} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d4ff3f]" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Category</label>
            <select name="category" value={form.category} onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d4ff3f]">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 bg-black text-white font-bold text-sm py-3.5 rounded-full hover:bg-gray-800 transition-colors disabled:opacity-60">
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Subscription'}
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

/* ── Subscription Card ─────────────────────────────────────────── */
const SubCard = ({ sub, onEdit, onDelete }) => {
  const days = getDaysUntil(sub.renewalDate);
  const urgent = days <= 7;
  const soon   = !urgent && days <= 14;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${CAT_COLORS[sub.category] || 'bg-gray-100'}`}>
            {CAT_ICONS[sub.category] || '🔔'}
          </div>
          <div>
            <h3 className="font-extrabold text-gray-900">{sub.name}</h3>
            <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-lg ${CAT_COLORS[sub.category] || 'bg-gray-100 text-gray-600'}`}>
              {sub.category}
            </span>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/>
            </svg>
          </button>
          <button onClick={onDelete} className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-black text-gray-900">${Number(sub.cost).toFixed(2)}<span className="text-sm font-semibold text-gray-400">/mo</span></p>
          <p className="text-xs text-gray-400 font-medium mt-0.5">Renews {fmtDate(sub.renewalDate)}</p>
        </div>
        <div className={`text-right px-3 py-1.5 rounded-xl ${urgent ? 'bg-red-100' : soon ? 'bg-yellow-100' : 'bg-gray-100'}`}>
          <p className={`text-xs font-black ${urgent ? 'text-red-600' : soon ? 'text-yellow-700' : 'text-gray-600'}`}>
            {days === 0 ? 'Today!' : days < 0 ? 'Overdue' : `${days}d`}
          </p>
          <p className={`text-[10px] font-semibold ${urgent ? 'text-red-500' : soon ? 'text-yellow-600' : 'text-gray-400'}`}>
            {days < 0 ? 'renewal' : 'until renewal'}
          </p>
        </div>
      </div>
    </div>
  );
};

/* ── Main Page ─────────────────────────────────────────────────── */
const blankForm = () => ({
  name: '', cost: '', category: 'Streaming',
  renewalDate: new Date().toISOString().slice(0, 10),
});

const Subscriptions = () => {
  const [subs, setSubs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit]     = useState(false);
  const [form, setForm]         = useState(blankForm());
  const [deleteId, setDeleteId] = useState(null);
  const [apiError, setApiError] = useState('');

  const fetchSubs = useCallback(async () => {
    try {
      const { data } = await api.get('/subscriptions');
      setSubs(data);
    } catch (err) {
      setApiError('Failed to load subscriptions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSubs(); }, [fetchSubs]);

  const openAdd = () => { setForm(blankForm()); setIsEdit(false); setModalOpen(true); };
  const openEdit = (sub) => {
    setForm({
      _id: sub._id,
      name: sub.name,
      cost: sub.cost,
      category: sub.category,
      renewalDate: sub.renewalDate?.slice(0, 10) || '',
    });
    setIsEdit(true);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.cost || !form.renewalDate) return;
    setSaving(true);
    try {
      if (isEdit) {
        const { data } = await api.put(`/subscriptions/${form._id}`, form);
        setSubs(prev => prev.map(s => s._id === data._id ? data : s));
      } else {
        const { data } = await api.post('/subscriptions', form);
        setSubs(prev => [...prev, data]);
      }
      setModalOpen(false);
    } catch (err) {
      setApiError('Failed to save subscription.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/subscriptions/${id}`);
      setSubs(prev => prev.filter(s => s._id !== id));
      setDeleteId(null);
    } catch (err) {
      setApiError('Failed to delete subscription.');
    }
  };

  const totalMonthly = subs.reduce((s, sub) => s + Number(sub.cost), 0);
  const totalYearly  = totalMonthly * 12;
  const renewingSoon = subs.filter(s => getDaysUntil(s.renewalDate) <= 7).length;

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
          <button onClick={() => setApiError('')} className="ml-4">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Subscriptions</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Track all your recurring subscriptions</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-black text-white font-bold text-sm px-5 py-3 rounded-full hover:bg-gray-800 transition-colors w-fit">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Subscription
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Monthly Cost', value: `$${totalMonthly.toFixed(2)}`, icon: '💳', bg: 'bg-indigo-50', color: 'text-indigo-700' },
          { label: 'Annual Cost', value: `$${totalYearly.toFixed(2)}`, icon: '📅', bg: 'bg-purple-50', color: 'text-purple-700' },
          { label: 'Renewing Soon', value: `${renewingSoon} service${renewingSoon !== 1 ? 's' : ''}`, icon: '⚡', bg: renewingSoon > 0 ? 'bg-red-50' : 'bg-green-50', color: renewingSoon > 0 ? 'text-red-600' : 'text-green-600' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-5 border border-white shadow-sm`}>
            <span className="text-xl">{s.icon}</span>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mt-2">{s.label}</p>
            <p className={`text-xl font-black mt-0.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Subscription grid */}
      {subs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 text-2xl">🔔</div>
          <h3 className="text-lg font-black text-gray-900 mb-2">No subscriptions yet</h3>
          <p className="text-gray-500 text-sm font-medium mb-6 max-w-xs">Track your recurring payments like Netflix, Spotify, and more.</p>
          <button onClick={openAdd}
            className="bg-black text-white font-bold text-sm px-6 py-3 rounded-full hover:bg-gray-800 transition-colors">
            Add Your First Subscription
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subs.map(sub => (
            <SubCard
              key={sub._id} sub={sub}
              onEdit={() => openEdit(sub)}
              onDelete={() => setDeleteId(sub._id)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <SubscriptionModal
          form={form} setForm={setForm}
          onSave={handleSave} onClose={() => setModalOpen(false)}
          isEdit={isEdit} saving={saving}
        />
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl">🗑️</div>
            <h3 className="text-lg font-black text-gray-900 mb-2">Remove Subscription?</h3>
            <p className="text-sm text-gray-500 font-medium mb-7">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-red-500 text-white font-bold text-sm py-3 rounded-full hover:bg-red-600 transition-colors">
                Remove
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

export default Subscriptions;
