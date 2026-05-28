import React, { useState, useMemo } from 'react';
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

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const COLORS = ['#d4ff3f', '#111', '#6b7280', '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f43f5e'];

/* ── Download helper ──────────────────────────────────────── */
function downloadFile(content, filename, type = 'text/csv') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/* ════════════════════════════════════════════════════════════ */
const Reports = () => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear]   = useState(now.getFullYear());
  const [downloaded, setDownloaded]       = useState(false);

  const allTx = useMemo(() => JSON.parse(localStorage.getItem('intellora_transactions') || '[]'), []);

  // Filter by selected month/year
  const monthlyTx = useMemo(() =>
    allTx.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
    }),
    [allTx, selectedMonth, selectedYear]
  );

  const monthIncome  = monthlyTx.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const monthExpense = monthlyTx.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const monthBalance = monthIncome - monthExpense;
  const savingsRate  = monthIncome > 0 ? ((monthIncome - monthExpense) / monthIncome * 100) : 0;

  // Category breakdown
  const catMap = {};
  monthlyTx.filter(t => t.type === 'expense').forEach(t => {
    const cat = t.category || 'Other';
    catMap[cat] = (catMap[cat] || 0) + Number(t.amount);
  });
  const categories = Object.entries(catMap)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  // Monthly trend (last 6 months)
  const trendData = useMemo(() => {
    const map = {};
    allTx.forEach(t => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!map[key]) map[key] = { income: 0, expense: 0 };
      if (t.type === 'income') map[key].income += Number(t.amount);
      else map[key].expense += Number(t.amount);
    });
    const keys = Object.keys(map).sort().slice(-6);
    return {
      labels: keys.map(k => {
        const [y, m] = k.split('-');
        return new Date(y, m - 1).toLocaleString('default', { month: 'short' });
      }),
      incomes: keys.map(k => map[k].income),
      expenses: keys.map(k => map[k].expense),
    };
  }, [allTx]);

  // Charts
  const comparisonData = {
    labels: ['Income', 'Expenses'],
    datasets: [{
      data: [monthIncome, monthExpense],
      backgroundColor: ['#10b981', '#ef4444'],
      borderWidth: 0,
    }],
  };
  const comparisonOpts = {
    responsive: true, maintainAspectRatio: false, cutout: '65%',
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 12, weight: 'bold' }, padding: 16 } } },
  };

  const categoryBarData = {
    labels: categories.map(c => c.category),
    datasets: [{
      label: 'Spending ($)',
      data: categories.map(c => c.amount),
      backgroundColor: COLORS.slice(0, categories.length),
      borderRadius: 8,
      borderSkipped: false,
    }],
  };
  const categoryBarOpts = {
    responsive: true, maintainAspectRatio: false, indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: {
      x: { beginAtZero: true, grid: { color: '#f3f4f6' }, border: { display: false } },
      y: { grid: { display: false }, border: { display: false } },
    },
  };

  const trendLineData = {
    labels: trendData.labels,
    datasets: [
      { label: 'Income', data: trendData.incomes, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', tension: 0.4, fill: true, pointBackgroundColor: '#10b981', pointRadius: 4 },
      { label: 'Expenses', data: trendData.expenses, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', tension: 0.4, fill: true, pointBackgroundColor: '#ef4444', pointRadius: 4 },
    ],
  };
  const trendLineOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'top', labels: { boxWidth: 10, font: { size: 11, weight: 'bold' } } } },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f3f4f6' }, border: { display: false } },
      x: { grid: { display: false }, border: { display: false } },
    },
  };

  // Download report as CSV
  const handleDownload = () => {
    const monthName = MONTHS[selectedMonth - 1];
    let csv = `Intellora — Financial Report\n`;
    csv += `Period: ${monthName} ${selectedYear}\n\n`;
    csv += `Summary\n`;
    csv += `Total Income,$${monthIncome.toLocaleString()}\n`;
    csv += `Total Expenses,$${monthExpense.toLocaleString()}\n`;
    csv += `Net Balance,$${monthBalance.toLocaleString()}\n`;
    csv += `Savings Rate,${savingsRate.toFixed(1)}%\n\n`;
    csv += `Category Breakdown\n`;
    csv += `Category,Amount,Percentage\n`;
    categories.forEach(c => {
      const pct = monthExpense > 0 ? ((c.amount / monthExpense) * 100).toFixed(1) : 0;
      csv += `${c.category},$${c.amount.toLocaleString()},${pct}%\n`;
    });
    csv += `\nTransactions\n`;
    csv += `Date,Description,Type,Category,Amount\n`;
    monthlyTx.forEach(t => {
      csv += `${t.date},${t.description},${t.type},${t.category},$${Number(t.amount).toLocaleString()}\n`;
    });

    downloadFile(csv, `Intellora_Report_${monthName}_${selectedYear}.csv`);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Financial Reports</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Generate and download monthly reports</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d4ff3f] bg-white"
          >
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m} {selectedYear}</option>)}
          </select>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-black text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download Report
          </button>
        </div>
      </div>

      {downloaded && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-semibold px-5 py-3 rounded-2xl flex items-center gap-2">
          <span>✓</span> Report downloaded successfully!
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Income', value: `$${monthIncome.toLocaleString()}`, icon: '📈', color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Expenses', value: `$${monthExpense.toLocaleString()}`, icon: '📉', color: 'text-red-500', bg: 'bg-red-50' },
          { label: 'Net Balance', value: `$${monthBalance.toLocaleString()}`, icon: '💰', color: monthBalance >= 0 ? 'text-blue-700' : 'text-red-500', bg: 'bg-blue-50' },
          { label: 'Savings Rate', value: `${savingsRate.toFixed(1)}%`, icon: '🎯', color: 'text-yellow-700', bg: 'bg-yellow-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-5 border border-white`}>
            <span className="text-2xl">{s.icon}</span>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mt-2">{s.label}</p>
            <p className={`text-2xl font-black mt-0.5 ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 font-medium mt-1">{MONTHS[selectedMonth - 1]} {selectedYear}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      {monthlyTx.length > 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Income vs Expenses donut */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-extrabold text-gray-900 mb-1">Income vs Expenses</h3>
              <p className="text-sm text-gray-400 font-medium mb-4">{MONTHS[selectedMonth - 1]} {selectedYear}</p>
              <div className="h-56">
                <Doughnut data={comparisonData} options={comparisonOpts} />
              </div>
            </div>

            {/* Category breakdown horizontal bar */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-extrabold text-gray-900 mb-1">Spending by Category</h3>
              <p className="text-sm text-gray-400 font-medium mb-4">Where your money went</p>
              <div style={{ height: Math.max(200, categories.length * 40) }}>
                <Bar data={categoryBarData} options={categoryBarOpts} />
              </div>
            </div>
          </div>

          {/* Trend line */}
          {trendData.labels.length > 1 && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-extrabold text-gray-900 mb-1">Income vs Expense Trend</h3>
              <p className="text-sm text-gray-400 font-medium mb-4">Last {trendData.labels.length} months</p>
              <div className="h-56">
                <Line data={trendLineData} options={trendLineOpts} />
              </div>
            </div>
          )}

          {/* Detailed category breakdown table */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-extrabold text-gray-900 mb-5">Category Details</h3>
            <div className="space-y-4">
              {categories.map((item, i) => {
                const pct = monthExpense > 0 ? Math.round((item.amount / monthExpense) * 100) : 0;
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

          {/* Transaction list for the month */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold text-gray-900">Transactions ({monthlyTx.length})</h3>
              <span className="text-xs bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full">{MONTHS[selectedMonth - 1]}</span>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {monthlyTx
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${tx.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {tx.type === 'income' ? '↑' : '↓'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{tx.description}</p>
                    <p className="text-xs text-gray-400 font-medium">{tx.category} · {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  </div>
                  <p className={`text-sm font-black ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.type === 'income' ? '+' : '-'}${Number(tx.amount).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="text-5xl mb-4">📊</div>
          <h3 className="text-xl font-black text-gray-900 mb-2">No Data for {MONTHS[selectedMonth - 1]}</h3>
          <p className="text-gray-500 text-sm font-medium max-w-sm leading-relaxed">
            There are no transactions recorded for this month. Try selecting a different month or add transactions on the Transactions page.
          </p>
        </div>
      )}
    </div>
  );
};

export default Reports;
