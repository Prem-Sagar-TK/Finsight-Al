require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Transaction = require('./src/models/Transaction');
const Budget = require('./src/models/Budget');
const Subscription = require('./src/models/Subscription');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/intellora');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Transaction.deleteMany();
    await Budget.deleteMany();
    await Subscription.deleteMany();

    // ── Create Demo User ────────────────────────────────────────────────
    const user = await User.create({
      name: 'Demo User',
      email: 'demo@intellora.com',
      password: 'password123', // Hashed by pre-save middleware
    });
    console.log('Demo User created: demo@intellora.com / password123');

    // ── Create Admin User ───────────────────────────────────────────────
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@intellora.com',
      password: 'adminpassword123', // Hashed by pre-save middleware
      role: 'admin',
    });
    console.log('Admin User created: admin@intellora.com / adminpassword123');

    // ── Helper: date N months ago, on a certain day ─────────────────────
    const now = new Date();
    const getDate = (monthsAgo, day) => {
      const d = new Date(now.getFullYear(), now.getMonth() - monthsAgo, day);
      return d;
    };

    // ── 50 Sample Transactions spread over last 6 months ────────────────
    const transactions = [
      // ── Month 0 (current) ──
      { user: user._id, amount: 5200, type: 'income',  category: 'Salary',        description: 'Monthly Salary',        date: getDate(0, 1) },
      { user: user._id, amount: 500,  type: 'income',  category: 'Freelance',     description: 'Website project',       date: getDate(0, 5) },
      { user: user._id, amount: 1200, type: 'expense', category: 'Housing',       description: 'Rent',                  date: getDate(0, 2),  isRecurring: true },
      { user: user._id, amount: 85,   type: 'expense', category: 'Utilities',     description: 'Internet bill',         date: getDate(0, 5),  isRecurring: true },
      { user: user._id, amount: 120,  type: 'expense', category: 'Utilities',     description: 'Electricity',           date: getDate(0, 6),  isRecurring: true },
      { user: user._id, amount: 280,  type: 'expense', category: 'Food',          description: 'Weekly groceries',      date: getDate(0, 8) },
      { user: user._id, amount: 75,   type: 'expense', category: 'Transport',     description: 'Fuel',                  date: getDate(0, 10) },
      { user: user._id, amount: 45,   type: 'expense', category: 'Entertainment', description: 'Netflix & Spotify',     date: getDate(0, 12), isRecurring: true },
      { user: user._id, amount: 180,  type: 'expense', category: 'Food',          description: 'Dining Out',            date: getDate(0, 15) },
      { user: user._id, amount: 60,   type: 'expense', category: 'Health',        description: 'Pharmacy',              date: getDate(0, 18) },

      // ── Month 1 ──
      { user: user._id, amount: 5200, type: 'income',  category: 'Salary',        description: 'Monthly Salary',        date: getDate(1, 1) },
      { user: user._id, amount: 1200, type: 'expense', category: 'Housing',       description: 'Rent',                  date: getDate(1, 2),  isRecurring: true },
      { user: user._id, amount: 95,   type: 'expense', category: 'Utilities',     description: 'Internet bill',         date: getDate(1, 5),  isRecurring: true },
      { user: user._id, amount: 310,  type: 'expense', category: 'Food',          description: 'Groceries',             date: getDate(1, 9) },
      { user: user._id, amount: 200,  type: 'expense', category: 'Shopping',      description: 'New Shoes',             date: getDate(1, 14) },
      { user: user._id, amount: 90,   type: 'expense', category: 'Transport',     description: 'Bus pass',              date: getDate(1, 3) },
      { user: user._id, amount: 45,   type: 'expense', category: 'Entertainment', description: 'Netflix & Spotify',     date: getDate(1, 12), isRecurring: true },
      { user: user._id, amount: 350,  type: 'expense', category: 'Travel',        description: 'Weekend trip',          date: getDate(1, 22) },
      { user: user._id, amount: 150,  type: 'expense', category: 'Food',          description: 'Dinner with friends',   date: getDate(1, 28) },
      { user: user._id, amount: 300,  type: 'income',  category: 'Investment',    description: 'Stock dividend',        date: getDate(1, 20) },

      // ── Month 2 ──
      { user: user._id, amount: 5200, type: 'income',  category: 'Salary',        description: 'Monthly Salary',        date: getDate(2, 1) },
      { user: user._id, amount: 1200, type: 'expense', category: 'Housing',       description: 'Rent',                  date: getDate(2, 2),  isRecurring: true },
      { user: user._id, amount: 85,   type: 'expense', category: 'Utilities',     description: 'Internet bill',         date: getDate(2, 5) },
      { user: user._id, amount: 260,  type: 'expense', category: 'Food',          description: 'Groceries',             date: getDate(2, 10) },
      { user: user._id, amount: 45,   type: 'expense', category: 'Entertainment', description: 'Streaming services',    date: getDate(2, 12) },
      { user: user._id, amount: 400,  type: 'expense', category: 'Shopping',      description: 'Clothing',              date: getDate(2, 15) },
      { user: user._id, amount: 120,  type: 'expense', category: 'Health',        description: 'Gym membership',        date: getDate(2, 5),  isRecurring: true },
      { user: user._id, amount: 250,  type: 'income',  category: 'Freelance',     description: 'Logo design',           date: getDate(2, 18) },
      { user: user._id, amount: 70,   type: 'expense', category: 'Education',     description: 'Online course',         date: getDate(2, 20) },

      // ── Month 3 ──
      { user: user._id, amount: 5200, type: 'income',  category: 'Salary',        description: 'Monthly Salary',        date: getDate(3, 1) },
      { user: user._id, amount: 1200, type: 'expense', category: 'Housing',       description: 'Rent',                  date: getDate(3, 2),  isRecurring: true },
      { user: user._id, amount: 85,   type: 'expense', category: 'Utilities',     description: 'Internet bill',         date: getDate(3, 5) },
      { user: user._id, amount: 310,  type: 'expense', category: 'Food',          description: 'Groceries',             date: getDate(3, 10) },
      { user: user._id, amount: 200,  type: 'expense', category: 'Transport',     description: 'Car service',           date: getDate(3, 14) },
      { user: user._id, amount: 600,  type: 'expense', category: 'Travel',        description: 'Flight tickets',        date: getDate(3, 20) },
      { user: user._id, amount: 80,   type: 'expense', category: 'Entertainment', description: 'Concerts',              date: getDate(3, 25) },
      { user: user._id, amount: 500,  type: 'income',  category: 'Freelance',     description: 'Consulting project',    date: getDate(3, 15) },

      // ── Month 4 ──
      { user: user._id, amount: 5200, type: 'income',  category: 'Salary',        description: 'Monthly Salary',        date: getDate(4, 1) },
      { user: user._id, amount: 1200, type: 'expense', category: 'Housing',       description: 'Rent',                  date: getDate(4, 2),  isRecurring: true },
      { user: user._id, amount: 85,   type: 'expense', category: 'Utilities',     description: 'Internet bill',         date: getDate(4, 5) },
      { user: user._id, amount: 290,  type: 'expense', category: 'Food',          description: 'Groceries',             date: getDate(4, 10) },
      { user: user._id, amount: 150,  type: 'expense', category: 'Health',        description: 'Doctor visit',          date: getDate(4, 12) },
      { user: user._id, amount: 55,   type: 'expense', category: 'Transport',     description: 'Taxi fares',            date: getDate(4, 18) },
      { user: user._id, amount: 45,   type: 'expense', category: 'Entertainment', description: 'Streaming services',    date: getDate(4, 12) },

      // ── Month 5 ──
      { user: user._id, amount: 5200, type: 'income',  category: 'Salary',        description: 'Monthly Salary',        date: getDate(5, 1) },
      { user: user._id, amount: 1200, type: 'expense', category: 'Housing',       description: 'Rent',                  date: getDate(5, 2),  isRecurring: true },
      { user: user._id, amount: 85,   type: 'expense', category: 'Utilities',     description: 'Internet bill',         date: getDate(5, 5) },
      { user: user._id, amount: 340,  type: 'expense', category: 'Food',          description: 'Groceries',             date: getDate(5, 10) },
      { user: user._id, amount: 45,   type: 'expense', category: 'Entertainment', description: 'Streaming services',    date: getDate(5, 12) },
      { user: user._id, amount: 220,  type: 'expense', category: 'Shopping',      description: 'Electronics',           date: getDate(5, 20) },
    ];

    await Transaction.insertMany(transactions);
    console.log(`${transactions.length} transactions seeded across 6 months`);

    // ── 5 Budgets for current month ─────────────────────────────────────
    const currentMonth = now.getMonth();
    const currentYear  = now.getFullYear();

    const budgets = [
      { user: user._id, category: 'Food',          limit: 600, month: currentMonth, year: currentYear },
      { user: user._id, category: 'Entertainment', limit: 150, month: currentMonth, year: currentYear },
      { user: user._id, category: 'Shopping',      limit: 300, month: currentMonth, year: currentYear },
      { user: user._id, category: 'Transport',     limit: 200, month: currentMonth, year: currentYear },
      { user: user._id, category: 'Health',        limit: 200, month: currentMonth, year: currentYear },
    ];

    await Budget.insertMany(budgets);
    console.log('5 Budgets seeded for current month');

    // ── Sample Subscriptions ────────────────────────────────────────────
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const subs = [
      { user: user._id, name: 'Netflix',   cost: 15.99, category: 'Streaming', renewalDate: new Date(now.getFullYear(), now.getMonth(), 15) },
      { user: user._id, name: 'Spotify',   cost: 9.99,  category: 'Music',     renewalDate: new Date(now.getFullYear(), now.getMonth(), 20) },
      { user: user._id, name: 'AWS',       cost: 12.00, category: 'Cloud',     renewalDate: nextMonth },
      { user: user._id, name: 'GitHub Pro',cost: 4.00,  category: 'Software',  renewalDate: nextMonth },
      { user: user._id, name: 'Xbox Game Pass', cost: 14.99, category: 'Gaming', renewalDate: new Date(now.getFullYear(), now.getMonth(), 28) },
    ];
    await Subscription.insertMany(subs);
    console.log('5 Subscriptions seeded');

    console.log('\n✅ Seed Complete!');
    console.log('Login at: demo@intellora.com / password123');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
