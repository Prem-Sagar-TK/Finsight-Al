import React, { useState } from 'react';
import { CURRENCIES, useCurrency } from '../context/CurrencyContext';

const FLAG_MAP = {
  USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', INR: '🇮🇳', JPY: '🇯🇵',
  CAD: '🇨🇦', AUD: '🇦🇺', CHF: '🇨🇭', CNY: '🇨🇳', BRL: '🇧🇷',
  MXN: '🇲🇽', SGD: '🇸🇬', AED: '🇦🇪', KRW: '🇰🇷', RUB: '🇷🇺',
};

const CurrencySetupModal = () => {
  const { selectCurrency, completeSetup } = useCurrency();
  const [selected, setSelected] = useState('USD');
  const [search, setSearch] = useState('');

  const filtered = CURRENCIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.includes(search)
  );

  const handleConfirm = () => selectCurrency(selected);
  const handleSkip    = () => completeSetup();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
        style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* ── Header ── */}
        <div className="bg-gradient-to-br from-[#d4ff3f] to-[#a8e600] px-8 pt-8 pb-6">
          <div className="w-14 h-14 bg-black/10 rounded-2xl flex items-center justify-center text-3xl mb-4">
            💱
          </div>
          <h2 className="text-2xl font-black text-gray-900">Choose your currency</h2>
          <p className="text-gray-700 font-medium text-sm mt-1">
            This will be used across all your financial data. You can change it anytime in Settings.
          </p>
        </div>

        {/* ── Search ── */}
        <div className="px-8 pt-5 pb-3">
          <div className="relative">
            <svg
              className="w-4 h-4 absolute left-3.5 top-3 text-gray-400"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search currency…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#d4ff3f]"
            />
          </div>
        </div>

        {/* ── Currency list ── */}
        <div className="px-8 pb-3 overflow-y-auto flex-1" style={{ minHeight: 0 }}>
          <div className="grid grid-cols-1 gap-2">
            {filtered.map((c) => {
              const isSelected = selected === c.code;
              return (
                <button
                  key={c.code}
                  onClick={() => setSelected(c.code)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-[#d4ff3f] bg-[#d4ff3f]/10'
                      : 'border-gray-100 bg-gray-50 hover:border-gray-300 hover:bg-white'
                  }`}
                >
                  <span className="text-2xl">{FLAG_MAP[c.code] || '🏳️'}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                      {c.name}
                    </p>
                    <p className="text-xs text-gray-400 font-medium">{c.code}</p>
                  </div>
                  <span className={`text-lg font-black shrink-0 ${isSelected ? 'text-gray-900' : 'text-gray-400'}`}>
                    {c.symbol}
                  </span>
                  {isSelected && (
                    <svg className="w-5 h-5 text-gray-900 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-center text-sm text-gray-400 font-medium py-6">No currency found</p>
            )}
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="px-8 py-5 border-t border-gray-100 flex gap-3">
          <button
            onClick={handleSkip}
            className="px-5 py-3 rounded-full border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 bg-black text-white font-bold text-sm py-3 rounded-full hover:bg-gray-800 transition-colors"
          >
            Use {CURRENCIES.find(c => c.code === selected)?.symbol} {selected}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CurrencySetupModal;
