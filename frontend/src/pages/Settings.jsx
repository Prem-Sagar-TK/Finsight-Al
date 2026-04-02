import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const Toggle = ({ enabled, onChange, label, description }) => (
  <div className="flex items-start justify-between py-4 border-b border-gray-100 last:border-0">
    <div className="pr-8">
      <p className="text-sm font-bold text-gray-800">{label}</p>
      {description && <p className="text-xs text-gray-400 font-medium mt-0.5 leading-relaxed">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex w-11 h-6 shrink-0 rounded-full transition-colors duration-200 focus:outline-none ${enabled ? 'bg-black' : 'bg-gray-200'}`}
    >
      <span className={`inline-block w-4 h-4 mt-1 rounded-full bg-white shadow transform transition-transform duration-200 ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

const Settings = () => {
  const [prefs, setPrefs] = useState({
    emailAlerts:     true,
    budgetAlerts:    true,
    weeklyReport:    false,
    aiTips:          true,
    darkMode:        false,
    compactView:     false,
    currency:        'USD',
    language:        'English',
  });

  const [saved, setSaved] = useState(false);
  const { darkMode: isDark, toggleDarkMode } = useTheme();

  // Sync initial state with ThemeContext
  React.useEffect(() => {
    if (prefs.darkMode !== isDark) setPrefs(p => ({ ...p, darkMode: isDark }));
  }, [isDark]);

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const handleSave = () => {
    localStorage.setItem('finsight_settings', JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl space-y-6">
      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-semibold px-5 py-3 rounded-2xl flex items-center gap-2">
          <span>✓</span> Settings saved successfully!
        </div>
      )}

      {/* Notifications */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <h3 className="text-lg font-black text-gray-900 mb-1">Notifications</h3>
        <p className="text-sm text-gray-400 font-medium mb-5">Choose what you want to be notified about</p>
        <Toggle
          enabled={prefs.emailAlerts} onChange={() => toggle('emailAlerts')}
          label="Email Alerts"
          description="Receive important account alerts via email"
        />
        <Toggle
          enabled={prefs.budgetAlerts} onChange={() => toggle('budgetAlerts')}
          label="Budget Limit Alerts"
          description="Get notified when you're approaching a budget limit"
        />
        <Toggle
          enabled={prefs.weeklyReport} onChange={() => toggle('weeklyReport')}
          label="Weekly Spending Report"
          description="Receive a weekly summary of your spending"
        />
        <Toggle
          enabled={prefs.aiTips} onChange={() => toggle('aiTips')}
          label="AI Personalised Tips"
          description="Let FinSight AI send you money-saving suggestions"
        />
      </div>

      {/* Display */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <h3 className="text-lg font-black text-gray-900 mb-1">Display</h3>
        <p className="text-sm text-gray-400 font-medium mb-5">Customise how the app looks</p>
        <Toggle
          enabled={prefs.darkMode} onChange={() => { toggle('darkMode'); toggleDarkMode(); }}
          label="Dark Mode"
          description="Switch to a dark colour scheme"
        />
        <Toggle
          enabled={prefs.compactView} onChange={() => toggle('compactView')}
          label="Compact View"
          description="Show more data with less spacing"
        />
      </div>

      {/* Regional */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <h3 className="text-lg font-black text-gray-900 mb-5">Regional</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Currency</label>
            <select
              value={prefs.currency}
              onChange={(e) => setPrefs((p) => ({ ...p, currency: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#d4ff3f]"
            >
              {['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Language</label>
            <select
              value={prefs.language}
              onChange={(e) => setPrefs((p) => ({ ...p, language: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#d4ff3f]"
            >
              {['English', 'Spanish', 'French', 'German', 'Hindi', 'Japanese'].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="bg-black text-white font-bold text-sm px-8 py-3.5 rounded-full hover:bg-gray-800 transition-colors shadow-lg"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;
