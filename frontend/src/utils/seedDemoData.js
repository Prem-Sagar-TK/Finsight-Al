/**
 * Intellora — Frontend Demo Data Seeder
 *
 * Call seedDemoData() to populate localStorage with sample
 * transactions and budgets for demonstration purposes.
 * This mirrors the backend seed.js but works entirely client-side.
 */

const TRANSACTIONS_KEY = 'intellora_transactions';
const BUDGETS_KEY      = 'intellora_budgets';

function getDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

const DEMO_TRANSACTIONS = [
  // Income
  { id: 'demo-1',  amount: 5000, type: 'income',  category: 'Salary',          description: 'Monthly Salary',       date: getDate(28) },
  { id: 'demo-2',  amount: 800,  type: 'income',  category: 'Freelance',       description: 'Freelance Project',     date: getDate(20) },

  // Expenses — varied categories with some recurring duplicates for subscription detection
  { id: 'demo-3',  amount: 1200, type: 'expense', category: 'Housing',         description: 'Rent',                  date: getDate(27) },
  { id: 'demo-4',  amount: 1200, type: 'expense', category: 'Housing',         description: 'Rent',                  date: getDate(57) },
  { id: 'demo-5',  amount: 50,   type: 'expense', category: 'Utilities',       description: 'Internet',              date: getDate(25) },
  { id: 'demo-6',  amount: 50,   type: 'expense', category: 'Utilities',       description: 'Internet',              date: getDate(55) },
  { id: 'demo-7',  amount: 100,  type: 'expense', category: 'Utilities',       description: 'Electricity',           date: getDate(22) },
  { id: 'demo-8',  amount: 300,  type: 'expense', category: 'Food & Drinks',   description: 'Groceries',             date: getDate(18) },
  { id: 'demo-9',  amount: 200,  type: 'expense', category: 'Food & Drinks',   description: 'Dining Out',            date: getDate(12) },
  { id: 'demo-10', amount: 250,  type: 'expense', category: 'Food & Drinks',   description: 'Groceries',             date: getDate(5) },
  { id: 'demo-11', amount: 150,  type: 'expense', category: 'Transport',       description: 'Gas',                   date: getDate(15) },
  { id: 'demo-12', amount: 80,   type: 'expense', category: 'Entertainment',   description: 'Netflix & Spotify',     date: getDate(10) },
  { id: 'demo-13', amount: 80,   type: 'expense', category: 'Entertainment',   description: 'Netflix & Spotify',     date: getDate(40) },
  { id: 'demo-14', amount: 50,   type: 'expense', category: 'Health',          description: 'Pharmacy',              date: getDate(8) },
  { id: 'demo-15', amount: 120,  type: 'expense', category: 'Shopping',        description: 'New Shoes',             date: getDate(6) },
  { id: 'demo-16', amount: 400,  type: 'expense', category: 'Travel',          description: 'Weekend Trip',          date: getDate(3) },
  { id: 'demo-17', amount: 35,   type: 'expense', category: 'Education',       description: 'Online Course',         date: getDate(14) },
];

const now = new Date();
const DEMO_BUDGETS = [
  { id: 'demo-b1', category: 'Food & Drinks',   limit: 600,  month: now.getMonth() + 1, year: now.getFullYear() },
  { id: 'demo-b2', category: 'Entertainment',   limit: 150,  month: now.getMonth() + 1, year: now.getFullYear() },
  { id: 'demo-b3', category: 'Shopping',        limit: 200,  month: now.getMonth() + 1, year: now.getFullYear() },
  { id: 'demo-b4', category: 'Transport',       limit: 200,  month: now.getMonth() + 1, year: now.getFullYear() },
];

export function seedDemoData() {
  const existing = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
  // Only seed if no transactions exist yet — don't overwrite user data
  if (existing.length === 0) {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(DEMO_TRANSACTIONS));
    localStorage.setItem(BUDGETS_KEY, JSON.stringify(DEMO_BUDGETS));
    return true; // seeded
  }
  return false; // already has data
}

export function clearDemoData() {
  localStorage.removeItem(TRANSACTIONS_KEY);
  localStorage.removeItem(BUDGETS_KEY);
}
