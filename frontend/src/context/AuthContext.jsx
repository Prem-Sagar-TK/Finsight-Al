import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

/* ──────────────────────────────────────────────────────────────────
   Mock Auth — stores users in localStorage so no backend is needed.
   Replace this with real API calls once MongoDB/backend is ready.
────────────────────────────────────────────────────────────────── */
const USERS_KEY = 'finsight_users';
const SESSION_KEY = 'finsight_session';

const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
const saveUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on page load
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      try { setCurrentUser(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, []);

  const register = async (name, email, password) => {
    // Simulate slight async delay
    await new Promise((r) => setTimeout(r, 500));

    if (!name || !email || !password) {
      return { success: false, error: 'All fields are required.' };
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    const users = getUsers();
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email: email.toLowerCase(),
      // In a real app, hash the password server-side. This is demo-only.
      password,
      createdAt: new Date().toISOString(),
    };

    saveUsers([...users, newUser]);

    const session = { id: newUser.id, name: newUser.name, email: newUser.email };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setCurrentUser(session);

    return { success: true };
  };

  const login = async (email, password) => {
    await new Promise((r) => setTimeout(r, 500));

    const users = getUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      return { success: false, error: 'Invalid email or password.' };
    }

    const session = { id: user.id, name: user.name, email: user.email };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setCurrentUser(session);

    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
