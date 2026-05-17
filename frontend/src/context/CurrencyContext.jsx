import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

/* ── Supported currencies ──────────────────────────────────────────── */
export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar',        locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro',             locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound',   locale: 'en-GB' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee',    locale: 'en-IN' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen',    locale: 'ja-JP' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', locale: 'en-CA' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc',    locale: 'de-CH' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan',    locale: 'zh-CN' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso',    locale: 'es-MX' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham',   locale: 'ar-AE' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', locale: 'ko-KR' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble',  locale: 'ru-RU' },
];

const STORAGE_KEY = 'finsight_currency';
const SETUP_KEY   = 'finsight_currency_setup_done';

const CurrencyContext = createContext();

/* ── Smart formatter ──────────────────────────────────────────────── */
/**
 * Formats a number with the user's preferred currency.
 * If the absolute value has more than 6 digits (>= 1,000,000),
 * it abbreviates: K / M / B / T so numbers never overflow their boxes.
 */
export function smartFormat(amount, currencyCode = 'USD', locale = 'en-US') {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  const sym = CURRENCIES.find(c => c.code === currencyCode)?.symbol ?? '$';

  if (abs >= 1_000_000_000_000) {
    return `${sign}${sym}${(abs / 1_000_000_000_000).toFixed(2)}T`;
  }
  if (abs >= 1_000_000_000) {
    return `${sign}${sym}${(abs / 1_000_000_000).toFixed(2)}B`;
  }
  if (abs >= 1_000_000) {
    return `${sign}${sym}${(abs / 1_000_000).toFixed(2)}M`;
  }
  // Under 1 million — use full Intl format
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${sign}${sym}${abs.toLocaleString(locale, { maximumFractionDigits: 2 })}`;
  }
}

/* ── Provider ──────────────────────────────────────────────────────── */
export const CurrencyProvider = ({ children }) => {
  const [currencyCode, setCurrencyCode] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'USD';
  });
  const [setupDone, setSetupDone] = useState(() => {
    return localStorage.getItem(SETUP_KEY) === 'true';
  });

  const currency = CURRENCIES.find(c => c.code === currencyCode) ?? CURRENCIES[0];

  const selectCurrency = useCallback((code) => {
    localStorage.setItem(STORAGE_KEY, code);
    localStorage.setItem(SETUP_KEY, 'true');
    setCurrencyCode(code);
    setSetupDone(true);
  }, []);

  // Format a monetary value
  const fmt = useCallback(
    (amount) => smartFormat(amount, currency.code, currency.locale),
    [currency]
  );

  // Mark setup done without changing currency (user skips)
  const completeSetup = useCallback(() => {
    localStorage.setItem(SETUP_KEY, 'true');
    setSetupDone(true);
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency, currencyCode, selectCurrency, fmt, setupDone, completeSetup }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
