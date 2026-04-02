import React, { useState, useRef, useEffect, useMemo } from 'react';

/* ── Rule-based response engine ────────────────────────────────────── */
function buildResponder(transactions) {
  const expenses = transactions.filter(t => t.type === 'expense');
  const income   = transactions.filter(t => t.type === 'income');
  const totalExp = expenses.reduce((s, t) => s + Number(t.amount), 0);
  const totalInc = income.reduce((s, t) => s + Number(t.amount), 0);
  const balance  = totalInc - totalExp;
  const savingsRate = totalInc > 0 ? ((totalInc - totalExp) / totalInc * 100).toFixed(1) : 0;

  const catMap = {};
  expenses.forEach(t => { const c = t.category || 'Other'; catMap[c] = (catMap[c] || 0) + Number(t.amount); });
  const topCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

  function respond(msg) {
    const m = msg.toLowerCase();

    if (/hi|hello|hey|howdy/.test(m)) return `Hey! 👋 I'm your FinSight AI assistant. Ask me about your balance, spending, tips, or budget!`;
    if (/who are you|what are you/.test(m)) return `I'm your **FinSight AI assistant** — a smart financial companion that analyzes your transaction data to give you personalized insights. 💡`;

    if (/balance/.test(m)) {
      if (transactions.length === 0) return `No transactions found yet. Add some on the Transactions page first!`;
      return balance >= 0
        ? `Your current balance is **$${balance.toLocaleString()}** 💰 — income of $${totalInc.toLocaleString()} minus expenses of $${totalExp.toLocaleString()}.`
        : `Your balance is **-$${Math.abs(balance).toLocaleString()}** ⚠️ — you're spending more than you earn. Review your expenses!`;
    }

    if (/income|earn/.test(m)) {
      if (totalInc === 0) return `No income transactions found. Add income entries on the Transactions page.`;
      return `Your total recorded income is **$${totalInc.toLocaleString()}** 📈.`;
    }

    if (/expens|spend|spent/.test(m)) {
      if (totalExp === 0) return `No expense transactions found yet.`;
      const topStr = topCats.length > 0 ? ` Your top spend is **${topCats[0][0]}** at $${topCats[0][1].toLocaleString()}.` : '';
      return `Your total expenses are **$${totalExp.toLocaleString()}** 📉.${topStr}`;
    }

    if (/top|biggest|most|largest/.test(m) && /categ|spend|expens/.test(m)) {
      if (topCats.length === 0) return `No expense categories found yet.`;
      const top3 = topCats.slice(0, 3).map(([c, a], i) => `${i + 1}. **${c}** — $${a.toLocaleString()}`).join('\n');
      return `Your top spending categories:\n${top3}`;
    }

    if (/saving|save/.test(m)) {
      if (totalInc === 0) return `Add income transactions to calculate your savings rate.`;
      return savingsRate >= 20
        ? `Your savings rate is **${savingsRate}%** 🏆 — excellent! The recommended minimum is 20%.`
        : `Your savings rate is **${savingsRate}%** — below the recommended 20%. Try cutting discretionary spending to improve it.`;
    }

    if (/budget/.test(m)) {
      const budgets = JSON.parse(localStorage.getItem('finsight_budgets') || '[]');
      if (budgets.length === 0) return `You haven't set any budgets yet. Head to the **Budget Planner** page to set monthly limits per category!`;
      const now = new Date();
      const curr = budgets.filter(b => b.month === now.getMonth() + 1 && b.year === now.getFullYear());
      if (curr.length === 0) return `No budgets set for this month. Go to **Budget Planner** to add some!`;
      const over = curr.filter(b => (catMap[b.category] || 0) > b.limit);
      if (over.length > 0) return `⚠️ You've exceeded your budget in **${over.map(b => b.category).join(', ')}** this month. Consider cutting back!`;
      return `You're within budget in all ${curr.length} categories this month. Great job! 🎉`;
    }

    if (/subscri/.test(m)) return `Head to the **Subscription Tracker** page — it auto-detects recurring expenses from your transaction history!`;

    if (/health|score/.test(m)) {
      if (transactions.length === 0) return `Add some transactions first to calculate your financial health score!`;
      let score = 50;
      if (totalInc > 0) { const r = (totalInc - totalExp) / totalInc; score += r > 0 ? Math.min(r * 100, 50) : Math.max(r * 50, -50); } else if (totalExp > 0) { score = 10; }
      score = Math.max(0, Math.min(100, Math.round(score)));
      const label = score >= 70 ? 'Excellent 🏆' : score >= 40 ? 'Fair ⚠️' : 'Needs Work 🚨';
      return `Your financial health score is **${score}/100** — ${label}. Check the **AI Insights** page for a full breakdown.`;
    }

    if (/tip|advice|suggest|recommend/.test(m)) {
      const tips = [
        '💡 Follow the 50/30/20 rule: 50% needs, 30% wants, 20% savings.',
        '💡 Track every expense — even small ones add up fast.',
        '💡 Cancel unused subscriptions — they silently drain your wallet.',
        '💡 Build an emergency fund of 3–6 months of expenses.',
        '💡 Pay yourself first — automate savings before spending.',
        '💡 Review your subscriptions monthly and cut what you don\'t use.',
      ];
      return tips[Math.floor(Math.random() * tips.length)];
    }

    if (/transaction|how many/.test(m)) {
      return `You have **${transactions.length} transactions** recorded — ${income.length} income and ${expenses.length} expenses.`;
    }

    if (/thank/.test(m)) return `You're welcome! 😊 Happy to help with your finances. Ask me anything!`;

    if (/help|what can you/.test(m)) {
      return `I can answer questions like:\n• "What's my balance?"\n• "What's my savings rate?"\n• "What's my top spending category?"\n• "How's my budget?"\n• "Give me a financial tip"\n• "What's my health score?"`;
    }

    return `Hmm, I'm not sure about that one. Try asking about your **balance**, **spending**, **savings rate**, **budget**, or ask for a **financial tip**! 💬`;
  }

  return respond;
}

/* ── Chat Bubble ────────────────────────────────────────────────────── */
const Bubble = ({ msg }) => {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-[#d4ff3f] flex items-center justify-center mr-2 shrink-0 self-end mb-0.5">
          <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg>
        </div>
      )}
      <div
        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed font-medium whitespace-pre-line ${
          isUser ? 'bg-black text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
        }`}
        dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }}
      />
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════ */
const AiChat = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hi! I'm your **FinSight AI** assistant 👋\nAsk me about your balance, spending, budget, or tips!" }
  ]);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  const transactions = useMemo(() => JSON.parse(localStorage.getItem('finsight_transactions') || '[]'), [open]);
  const respond = useMemo(() => buildResponder(transactions), [transactions]);

  useEffect(() => {
    if (open) { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); inputRef.current?.focus(); }
  }, [open, messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const next = [...messages, { role: 'user', text }];
    setMessages(next);
    setInput('');
    setTimeout(() => {
      const reply = respond(text);
      setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    }, 400);
  };

  const handleKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  const QUICK = ['What\'s my balance?', 'Top spending category?', 'Give me a financial tip', 'How\'s my budget?'];

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-black shadow-xl flex items-center justify-center hover:scale-110 transition-all duration-200 group"
        title="AI Chat Assistant"
      >
        {open ? (
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        ) : (
          <svg className="w-6 h-6 text-[#d4ff3f]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg>
        )}
        {/* Pulse ring */}
        {!open && <span className="absolute inset-0 rounded-full animate-ping bg-[#d4ff3f] opacity-20" />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          style={{ maxHeight: '70vh', height: '520px' }}>
          {/* Header */}
          <div className="bg-black px-5 py-4 flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-full bg-[#d4ff3f] flex items-center justify-center">
              <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg>
            </div>
            <div>
              <p className="text-white font-extrabold text-sm">FinSight AI</p>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <p className="text-gray-400 text-xs font-medium">Online</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {messages.map((m, i) => <Bubble key={i} msg={m} />)}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto shrink-0">
            {QUICK.map(q => (
              <button key={q}
                onClick={() => { setInput(q); inputRef.current?.focus(); }}
                className="text-[10px] font-bold text-gray-600 bg-gray-100 hover:bg-[#d4ff3f] hover:text-black rounded-full px-3 py-1.5 whitespace-nowrap transition-colors">
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-4 pb-4 shrink-0">
            <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2.5">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about your finances..."
                className="flex-1 bg-transparent text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none"
              />
              <button
                onClick={send}
                disabled={!input.trim()}
                className="w-8 h-8 rounded-full bg-black disabled:bg-gray-300 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" strokeLinejoin="round" strokeLinecap="round"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AiChat;
