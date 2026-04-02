import React, { useMemo } from 'react';

const CAT_ICONS = { Food: '🍔', Transport: '🚗', Shopping: '🛍️', Entertainment: '🎮', Health: '💊', Education: '📚', Utilities: '💡', Other: '📦' };

/* ── Detect recurring transactions ─────────────────────────────────── */
function detectSubscriptions(transactions) {
  // Group expense transactions by (description, amount) pair
  const groups = {};
  transactions
    .filter(t => t.type === 'expense' && (t.description || t.note))
    .forEach(t => {
      const key = `${(t.description || t.note || '').trim().toLowerCase()}__${Number(t.amount).toFixed(2)}`;
      if (!groups[key]) groups[key] = { description: t.description || t.note, amount: Number(t.amount), category: t.category || 'Other', dates: [] };
      groups[key].dates.push(new Date(t.date));
    });

  const subs = [];
  Object.values(groups).forEach(g => {
    if (g.dates.length >= 2) {
      g.dates.sort((a, b) => a - b);
      const latest = g.dates[g.dates.length - 1];
      // Estimate next date: same day next month
      const next = new Date(latest);
      next.setMonth(next.getMonth() + 1);
      subs.push({ ...g, occurrences: g.dates.length, lastDate: latest, nextDate: next });
    }
  });
  return subs.sort((a, b) => b.amount - a.amount);
}

/* ── Subscription Card ─────────────────────────────────────────────── */
const SubCard = ({ sub }) => {
  const nextFmt = sub.nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const daysUntil = Math.ceil((sub.nextDate - new Date()) / (1000 * 60 * 60 * 24));
  const urgency = daysUntil <= 7 ? 'text-red-500' : daysUntil <= 14 ? 'text-yellow-500' : 'text-green-500';

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl shrink-0">
        {CAT_ICONS[sub.category] || '📦'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-extrabold text-gray-900 text-sm truncate capitalize">{sub.description}</p>
        <p className="text-xs text-gray-400 font-medium mt-0.5">{sub.category} · {sub.occurrences} payments detected</p>
        <div className="flex items-center gap-1 mt-1">
          <svg className="w-3 h-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          <span className="text-xs text-gray-500 font-medium">Next: {nextFmt}</span>
          <span className={`text-xs font-bold ${urgency}`}>({daysUntil > 0 ? `in ${daysUntil}d` : 'due!'})</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-lg font-black text-gray-900">${sub.amount.toLocaleString()}</p>
        <p className="text-xs text-gray-400 font-medium">/month</p>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════ */
const Subscriptions = () => {
  const transactions = useMemo(() => JSON.parse(localStorage.getItem('finsight_transactions') || '[]'), []);
  const subs = useMemo(() => detectSubscriptions(transactions), [transactions]);

  const totalMonthly = subs.reduce((s, sub) => s + sub.amount, 0);
  const totalAnnual  = totalMonthly * 12;
  const dueThisWeek  = subs.filter(s => {
    const d = Math.ceil((s.nextDate - new Date()) / (1000 * 60 * 60 * 24));
    return d >= 0 && d <= 7;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Subscription Tracker</h1>
        <p className="text-gray-500 text-sm font-medium mt-1">Auto-detected from your recurring expenses</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Monthly Total', value: `$${totalMonthly.toFixed(2)}`, icon: '💳', color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'Annual Cost', value: `$${totalAnnual.toFixed(0)}`, icon: '📅', color: 'text-purple-700', bg: 'bg-purple-50' },
          { label: 'Due This Week', value: `${dueThisWeek}`, icon: '⏰', color: dueThisWeek > 0 ? 'text-red-600' : 'text-green-600', bg: dueThisWeek > 0 ? 'bg-red-50' : 'bg-green-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-white`}>
            <span className="text-xl">{s.icon}</span>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mt-2">{s.label}</p>
            <p className={`text-xl font-black mt-0.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* How it works info */}
      {subs.length === 0 && transactions.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex items-start gap-3">
          <span className="text-xl shrink-0">💡</span>
          <div>
            <p className="font-bold text-gray-900 text-sm">No subscriptions detected yet</p>
            <p className="text-gray-600 text-sm mt-1">This tracker looks for expense transactions with the same description and amount appearing 2+ times. Make sure your transactions have descriptions filled in.</p>
          </div>
        </div>
      )}

      {subs.length === 0 && transactions.length === 0 && (
        <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="text-5xl mb-4">🔄</div>
          <h3 className="text-xl font-black text-gray-900 mb-2">No Transactions Yet</h3>
          <p className="text-gray-500 text-sm font-medium max-w-sm leading-relaxed">
            Add transactions on the Transactions page. Recurring ones (same description + amount appearing 2+ times) will appear here automatically.
          </p>
        </div>
      )}

      {/* Subscription list */}
      {subs.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-extrabold text-gray-900">Detected Subscriptions ({subs.length})</h3>
            <span className="text-xs bg-[#d4ff3f] text-black font-bold px-3 py-1 rounded-full">Auto-detected</span>
          </div>
          <div className="space-y-3">
            {subs.map((sub, i) => <SubCard key={i} sub={sub} />)}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-[#111] rounded-3xl p-6 text-white">
        <h3 className="font-extrabold text-lg mb-3">💰 Subscription Tips</h3>
        <ul className="space-y-2.5 text-sm text-gray-300">
          <li className="flex items-start gap-2"><span className="text-[#d4ff3f] font-bold shrink-0">→</span> Review subscriptions you haven't used in the last 30 days — cancel them to save money.</li>
          <li className="flex items-start gap-2"><span className="text-[#d4ff3f] font-bold shrink-0">→</span> Annual billing is typically 15–20% cheaper than monthly billing.</li>
          <li className="flex items-start gap-2"><span className="text-[#d4ff3f] font-bold shrink-0">→</span> Consider sharing family plans for streaming services to split costs.</li>
          {totalAnnual > 0 && <li className="flex items-start gap-2"><span className="text-[#d4ff3f] font-bold shrink-0">→</span> You're spending <strong className="text-white">${totalAnnual.toFixed(0)}/year</strong> on subscriptions — that's ${(totalAnnual / 52).toFixed(0)}/week.</li>}
        </ul>
      </div>
    </div>
  );
};

export default Subscriptions;
