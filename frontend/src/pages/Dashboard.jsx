import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useCurrency } from '../context/CurrencyContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

/* ── Stat card ─────────────────────────────────────────────────── */
const StatCard = ({ label, value, badge, badgeClass, iconBg, icon, dark }) => (
  <div className={`p-6 rounded-3xl shadow-sm border flex flex-col justify-between gap-4 ${dark ? 'bg-[#111] border-transparent' : 'bg-white border-gray-100'}`}>
    <div className="flex items-center justify-between">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBg}`}>{icon}</div>
      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg ${badgeClass}`}>{badge}</span>
    </div>
    <div>
      <p className={`text-sm font-semibold mb-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
      <p className={`text-3xl font-black tracking-tight ${dark ? 'text-[#d4ff3f]' : 'text-gray-900'}`}>{value}</p>
    </div>
  </div>
);

/* ── Empty state ───────────────────────────────────────────────── */
const EmptyState = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      </div>
      <h3 className="text-xl font-black text-gray-900 mb-2">No transactions yet</h3>
      <p className="text-gray-500 text-sm font-medium max-w-xs leading-relaxed mb-8">
        Add your first transaction or upload a CSV file to start tracking your spending and see AI insights.
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={() => navigate('/dashboard/transactions', { state: { openAdd: true } })}
          className="bg-black text-white font-bold text-sm px-5 py-3 rounded-full hover:bg-gray-800 transition-colors">
          Add Transaction
        </button>
        <button
          onClick={() => navigate('/dashboard/transactions', { state: { openCSV: true } })}
          className="bg-gray-100 text-black font-bold text-sm px-5 py-3 rounded-full hover:bg-gray-200 transition-colors">
          Upload CSV
        </button>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════ */
const Dashboard = () => {
  const { currentUser } = useAuth();
  const { fmt } = useCurrency();
  const [transactions, setTransactions] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txRes, insRes] = await Promise.all([
          api.get('/transactions'),
          api.get('/insights'),
        ]);
        setTransactions(txRes.data);
        setInsights(insRes.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin w-8 h-8 border-4 border-[#d4ff3f] border-t-transparent rounded-full" />
      </div>
    );
  }

  const hasData = transactions.length > 0;

  const totalIncome  = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const balance      = totalIncome - totalExpense;
  const savingsRate  = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  const healthScore = Math.min(100, Math.max(0, Math.round(savingsRate * 0.6 + (balance > 0 ? 30 : 0) + 10)));

  // Category spending breakdown
  const categoryMap = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const cat = t.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + Number(t.amount);
    });
  const categorySpending = Object.entries(categoryMap).map(([category, amount]) => ({ category, amount }));

  // AI insights
  const aiInsights = insights?.insights || [];

  const COLORS = ['#d4ff3f', '#111', '#6b7280', '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

  const barData = {
    labels: categorySpending.map((c) => c.category),
    datasets: [{
      label: 'Spending',
      data: categorySpending.map((c) => c.amount),
      backgroundColor: '#d4ff3f',
      borderRadius: 8,
      borderSkipped: false,
    }],
  };
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f3f4f6' }, border: { display: false } },
      x: { grid: { display: false }, border: { display: false } },
    },
  };

  const donutData = {
    labels: categorySpending.map((c) => c.category),
    datasets: [{
      data: categorySpending.map((c) => c.amount),
      backgroundColor: COLORS.slice(0, categorySpending.length),
      borderWidth: 0,
    }],
  };
  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11, weight: 'bold' }, padding: 16 } },
    },
  };

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Current Balance" value={fmt(balance)}
          badge="Total" badgeClass="bg-gray-100 text-gray-600"
          iconBg="bg-gray-100"
          icon={<svg className="w-6 h-6 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>}
        />
        <StatCard
          label="Total Income" value={fmt(totalIncome)}
          badge="Income" badgeClass="bg-green-100 text-green-700"
          iconBg="bg-green-50"
          icon={<svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23,6 13.5,15.5 8.5,10.5 1,18" /><polyline points="17,6 23,6 23,12" /></svg>}
        />
        <StatCard
          label="Total Expenses" value={fmt(totalExpense)}
          badge="Expense" badgeClass="bg-red-100 text-red-600"
          iconBg="bg-red-50"
          icon={<svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23,18 13.5,8.5 8.5,13.5 1,6" /><polyline points="17,18 23,18 23,12" /></svg>}
        />
        <StatCard
          label="Health Score" value={hasData ? `${healthScore}/100` : '—'}
          badge="Score" badgeClass="bg-[#d4ff3f]/30 text-black"
          iconBg="bg-white/10"
          icon={<svg className="w-6 h-6 text-[#d4ff3f]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>}
          dark
        />
      </div>

      {!hasData ? (
        <EmptyState />
      ) : (
        <>
          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900">Spending Analysis</h3>
                  <p className="text-sm text-gray-400 font-medium mt-0.5">Breakdown by category</p>
                </div>
              </div>
              <div className="h-64">
                <Bar data={barData} options={barOptions} />
              </div>
            </div>

            <div className="bg-[#111] rounded-3xl p-6 shadow-md flex flex-col">
              <h3 className="text-lg font-extrabold text-white mb-1">Distribution</h3>
              <p className="text-sm text-gray-500 font-medium mb-4">Category breakdown</p>
              <div className="h-56">
                <Doughnut data={donutData} options={donutOptions} />
              </div>
              <div className="mt-4 bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-xs text-gray-400 font-semibold mb-1">Savings Rate</p>
                <div className="flex items-center justify-between">
                  <div className="h-2 flex-1 bg-white/10 rounded-full mr-3 overflow-hidden">
                    <div className="h-2 bg-[#d4ff3f] rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(0, savingsRate)}%` }} />
                  </div>
                  <span className="text-sm font-extrabold text-[#d4ff3f]">{savingsRate}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights + Financial Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-5">
                <div className="bg-[#d4ff3f] rounded-xl p-2">
                  <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                  </svg>
                </div>
                <h3 className="text-lg font-extrabold text-gray-900">AI Recommendations</h3>
              </div>
              {aiInsights.length > 0 ? (
                <div className="space-y-3">
                  {aiInsights.map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-2xl p-4">
                      <span className="bg-green-500 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-sm font-semibold text-gray-800 leading-relaxed">{insight}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm font-medium">Add more transactions to unlock AI recommendations.</p>
              )}
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-extrabold text-gray-900 mb-5">Financial Summary</h3>
              <div className="space-y-4">
                {categorySpending.slice(0, 5).map((item) => {
                  const pct = totalExpense > 0 ? Math.round((item.amount / totalExpense) * 100) : 0;
                  return (
                    <div key={item.category}>
                      <div className="flex justify-between text-sm font-bold mb-1.5">
                        <span className="text-gray-700">{item.category}</span>
                        <span className="text-gray-500">
                          {fmt(item.amount)} <span className="text-gray-400 font-semibold text-xs">({pct}%)</span>
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-2 bg-[#d4ff3f] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
