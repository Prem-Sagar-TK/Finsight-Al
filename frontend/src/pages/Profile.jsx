import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const initials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

const Profile = () => {
  const { currentUser } = useAuth();
  const [name, setName]       = useState(currentUser?.name || '');
  const [email, setEmail]     = useState(currentUser?.email || '');
  const [saved, setSaved]     = useState(false);
  const [editing, setEditing] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    // Persist to session in localStorage
    const session = { ...currentUser, name, email };
    localStorage.setItem('finsight_session', JSON.stringify(session));
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const joined = currentUser?.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  return (
    <div className="max-w-2xl space-y-6">
      {/* Avatar card */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-[#d4ff3f] flex items-center justify-center shrink-0 shadow-lg">
          <span className="text-black text-2xl font-black">{initials(currentUser?.name)}</span>
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900">{currentUser?.name || 'User'}</h2>
          <p className="text-gray-500 font-medium text-sm mt-1">{currentUser?.email}</p>
          <span className="inline-block mt-2 bg-[#d4ff3f]/30 text-black text-xs font-black px-3 py-1 rounded-full">
            Free Plan · Joined {joined}
          </span>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black text-gray-900">Personal Information</h3>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-sm font-bold text-black bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full transition-colors"
            >
              Edit
            </button>
          )}
        </div>

        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-semibold px-4 py-3 rounded-2xl mb-5 flex items-center gap-2">
            <span>✓</span> Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              disabled={!editing}
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#d4ff3f] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              disabled={!editing}
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#d4ff3f] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            />
          </div>

          {editing && (
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="bg-black text-white font-bold text-sm px-6 py-3 rounded-full hover:bg-gray-800 transition-colors"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => { setEditing(false); setName(currentUser?.name || ''); setEmail(currentUser?.email || ''); }}
                className="bg-gray-100 text-black font-bold text-sm px-6 py-3 rounded-full hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Security */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <h3 className="text-lg font-black text-gray-900 mb-5">Security</h3>
        <div className="flex items-center justify-between py-4 border-b border-gray-100">
          <div>
            <p className="text-sm font-bold text-gray-800">Password</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Last changed recently</p>
          </div>
          <button className="text-sm font-bold text-black bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full transition-colors">
            Change
          </button>
        </div>
        <div className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm font-bold text-gray-800">Two-Factor Authentication</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Add an extra layer of security</p>
          </div>
          <button className="text-sm font-bold text-[#22c55e] bg-green-50 hover:bg-green-100 px-4 py-2 rounded-full transition-colors">
            Enable
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
