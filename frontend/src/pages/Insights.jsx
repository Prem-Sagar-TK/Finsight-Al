import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Title, Tooltip, Legend
);

/* ── Gauge SVG ─────────────────────────────────────────────────────── */
const HealthGauge = ({ score }) => {
  const clamp = Math.max(0, Math.min(100, score));
  // Semi-circle: 0=left, 100=right, sweep 180deg
  const angle = (clamp / 100) * 180 - 90; // -90 to 90 deg
  const rad = (angle * Math.PI) / 180;
  const cx = 100, cy = 100, r = 80;
  const needleX = cx + r * Math.cos(rad) * 0.85;
  const needleY = cy + r * Math.sin(rad) * 0.85;
  const color = clamp >= 70 ? '#22c55e' : clamp >= 40 ? '#f59e0b' : '#ef4444';
  const label = clamp >= 70 ? 'Excellent' : clamp >= 40 ? 'Fair' : 'Needs Work';

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 115" className="w-full max-w-[220px]">
        {/* Background arc */}
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e5e7eb" strokeWidth="14" strokeLinecap="round" />
        {/* Colored arc — proportional */}
        {clamp > 0 && (
          <path
            d={`M 20 100 A 80 80 0 ${clamp >= 50 ? 1 : 0} 1 ${cx + r * Math.cos(rad)} ${cy + r * Math.sin(rad)}`}
            fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
          />
        )}
        {/* Needle */}
        <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="#111" strokeWidth="3" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="6" fill="#111" />
        {/* Score text */}
        <text x={cx} y="88" textAnchor="middle" fontSize="26" fontWeight="900" fill="#111">{clamp}</text>
        <text x={cx} y="108" textAnchor="middle" fontSize="10" fontWeight="600" fill="#6b7280">out of 100</text>
      </svg>
      <span className="text-sm font-bold mt-1" style={{ color }}>{label}</span>
    </div>
  );
};

/* ── Insight Card ──────────────────────────────────────────────────── */
const InsightCard = ({ icon, title, text, accent }) => (
  <div className={`flex items-start gap-4 p-5 rounded-2xl border ${accent}`}>
    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white shadow-sm text-xl">
      {icon}
    </div>
    <div>
      <p className="font-bold text-gray-900 text-sm mb-0.5">{title}</p>
      <p className="text-gray-600 text-sm leading-relaxed">{text}</p>
    </div>
  </div>
);

/* ════════════════════════════════════════════════════════════════════ */
const Insights = () => {
  const storedTx = useMemo(() => JSON.parse(localStorage.getItem('finsight_transactions') || '[]'), []);
  const hasData = storedTx.length > 0;

  const totalIncome  = storedTx.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = storedTx.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const balance      = totalIncome - totalExpense;
  const savingsRate  = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  // Category spending
  const categoryMap = {};
  storedTx.filter(t => t.type === 'expense').forEach(t => {
    const cat = t.category || 'Other';
    categoryMap[cat] = (categoryMap[cat] || 0) + Number(t.amount);
  });
  const categories = Object.entries(categoryMap)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  // Monthly trend (last 6 months)
  const monthlyMap = {};
  storedTx.filter(t => t.type === 'expense').forEach(t => {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlyMap[key] = (monthlyMap[key] || 0) + Number(t.amount);
  });
  const sortedMonths = Object.keys(monthlyMap).sort().slice(-6);
  const trendLabels = sortedMonths.map(k => {
    const [y, m] = k.split('-');
    return new Date(y, m - 1).toLocaleString('default', { month: 'short' });
  });
  const trendData = sortedMonths.map(k => monthlyMap[k]);

  // Health score
  let healthScore = 50;
  if (totalIncome > 0) {
    const rate = (totalIncome - totalExpense) / totalIncome;
    healthScore += rate > 0 ? Math.min(rate * 100, 50) : Math.max(rate * 50, -50);
  } else if (totalExpense > 0) {
    healthScore = 10;
  }
  healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));

  // AI insights
  const insights = [];
  if (!hasData) {
    insights.push({ icon: '📊', title: 'No Data Yet', text: 'Add transactions on the Transactions page to unlock personalized insights.', accent: 'bg-gray-50 border-gray-200' });
  } else {
    if (savingsRate >= 20) insights.push({ icon: '🏆', title: 'Great Saver!', text: `You're saving ${savingsRate.toFixed(1)}% of your income — above the recommended 20%.`, accent: 'bg-green-50 border-green-200' });
    else if (savingsRate > 0) insights.push({ icon: '💡', title: 'Boost Your Savings', text: `Your savings rate is ${savingsRate.toFixed(1)}%. Try to save at least 20% to build a strong financial cushion.`, accent: 'bg-yellow-50 border-yellow-200' });
    else if (savingsRate < 0) insights.push({ icon: '⚠️', title: 'Overspending Alert', text: 'Your expenses exceed your income. Review your spending immediately.', accent: 'bg-red-50 border-red-200' });
    if (categories.length > 0) {
      const top = categories[0];
      const pct = totalExpense > 0 ? Math.round((top.amount / totalExpense) * 100) : 0;
      insights.push({ icon: '🎯', title: `Top Spend: ${top.category}`, text: `${top.category} accounts for ${pct}% of your total expenses ($${top.amount.toLocaleString()}).`, accent: 'bg-blue-50 border-blue-200' });
    }
    if (balance > 0) insights.push({ icon: '✅', title: 'Positive Balance', text: `You have a net positive balance of $${balance.toLocaleString()}. Keep it up!`, accent: 'bg-green-50 border-green-200' });
    if (categories.length >= 3) {
      insights.push({ icon: '📉', title: 'Spending Tip', text: `Try reducing ${categories[categories.length - 1].category} (your smallest category) to find easy savings.`, accent: 'bg-purple-50 border-purple-200' });
    }
  }

  const COLORS = ['#d4ff3f', '#111', '#6b7280', '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

  const barData = {
    labels: categories.map(c => c.category),
    datasets: [{ label: 'Spending ($)', data: categories.map(c => c.amount), backgroundColor: '#d4ff3f', borderRadius: 8, borderSkipped: false }],
  };
  const barOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f3f4f6' }, border: { display: false } },
      x: { grid: { display: false }, border: { display: false } },
    },
  };

  const donutData = {
    labels: categories.map(c => c.category),
    datasets: [{ data: categories.map(c => c.amount), backgroundColor: COLORS.slice(0, categories.length), borderWidth: 0 }],
  };
  const donutOpts = { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 }, padding: 12 } } } };

  const lineData = {
    labels: trendLabels,
    datasets: [{ label: 'Monthly Expenses ($)', data: trendData, borderColor: '#d4ff3f', backgroundColor: 'rgba(212,255,63,0.15)', tension: 0.4, fill: true, pointBackgroundColor: '#111', pointRadius: 5 }],
  };
  const lineOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f3f4f6' }, border: { display: false } },
      x: { grid: { display: false }, border: { display: false } },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">AI Insights</h1>
        <p className="text-gray-500 text-sm font-medium mt-1">Personalized financial analysis powered by your data</p>
      </div>

      {/* Health Score + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Gauge */}
        <div className="bg-[#111] rounded-3xl p-6 flex flex-col items-center justify-center gap-3 shadow-md">
          <h3 className="text-white font-extrabold text-lg">Financial Health Score</h3>
          <HealthGauge score={healthScore} />
          <div className="flex gap-4 mt-1">
            {[{ label: 'Needs Work', color: '#ef4444', range: '0–39' }, { label: 'Fair', color: '#f59e0b', range: '40–69' }, { label: 'Excellent', color: '#22c55e', range: '70–100' }].map(s => (
              <div key={s.label} className="text-center">
                <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ background: s.color }} />
                <p className="text-[10px] text-gray-400 font-semibold">{s.range}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Key metrics */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {[
            { label: 'Total Income', value: `$${totalIncome.toLocaleString()}`, sub: 'All time', bg: 'bg-green-50', text: 'text-green-700', icon: '📈' },
            { label: 'Total Expenses', value: `$${totalExpense.toLocaleString()}`, sub: 'All time', bg: 'bg-red-50', text: 'text-red-600', icon: '📉' },
            { label: 'Net Balance', value: `$${balance.toLocaleString()}`, sub: balance >= 0 ? 'Positive ✓' : 'Negative ✗', bg: balance >= 0 ? 'bg-blue-50' : 'bg-red-50', text: balance >= 0 ? 'text-blue-700' : 'text-red-600', icon: '💰' },
            { label: 'Savings Rate', value: `${Math.max(0, savingsRate.toFixed(1))}%`, sub: savingsRate >= 20 ? 'Above target ✓' : 'Below 20% target', bg: 'bg-yellow-50', text: 'text-yellow-700', icon: '🎯' },
          ].map(m => (
            <div key={m.label} className={`${m.bg} rounded-2xl p-5 flex flex-col justify-between border border-white`}>
              <span className="text-2xl mb-2">{m.icon}</span>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{m.label}</p>
                <p className={`text-2xl font-black ${m.text}`}>{m.value}</p>
                <p className="text-xs text-gray-400 mt-0.5 font-medium">{m.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insight Cards */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-5">
          <div className="bg-[#d4ff3f] rounded-xl p-2">
            <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          </div>
          <h3 className="text-lg font-extrabold text-gray-900">AI Recommendations</h3>
        </div>
        <div className="space-y-3">
          {insights.map((ins, i) => <InsightCard key={i} {...ins} />)}
        </div>
      </div>

      {/* Charts */}
      {hasData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Bar chart */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
            <h3 className="text-lg font-extrabold text-gray-900 mb-1">Spending by Category</h3>
            <p className="text-sm text-gray-400 font-medium mb-4">Where your money goes</p>
            <div className="h-56">
              <Bar data={barData} options={barOpts} />
            </div>
          </div>

          {/* Donut */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-extrabold text-gray-900 mb-1">Distribution</h3>
            <p className="text-sm text-gray-400 font-medium mb-4">Category %</p>
            <div className="h-56">
              <Doughnut data={donutData} options={donutOpts} />
            </div>
          </div>
        </div>
      )}

      {/* Spending trend */}
      {trendLabels.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-extrabold text-gray-900 mb-1">Monthly Spending Trend</h3>
          <p className="text-sm text-gray-400 font-medium mb-4">Last {trendLabels.length} months</p>
          <div className="h-52">
            <Line data={lineData} options={lineOpts} />
          </div>
        </div>
      )}

      {/* Category breakdown table */}
      {categories.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-extrabold text-gray-900 mb-5">Detailed Breakdown</h3>
          <div className="space-y-4">
            {categories.map((item, i) => {
              const pct = totalExpense > 0 ? Math.round((item.amount / totalExpense) * 100) : 0;
              return (
                <div key={item.category}>
                  <div className="flex justify-between text-sm font-semibold mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-800">{item.category}</span>
                    </div>
                    <span className="text-gray-500">${item.amount.toLocaleString()} <span className="text-gray-400 text-xs">({pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Insights;
