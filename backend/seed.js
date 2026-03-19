require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Transaction = require('./src/models/Transaction');
const Budget = require('./src/models/Budget');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finsight');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing
    await User.deleteMany();
    await Transaction.deleteMany();
    await Budget.deleteMany();

    // Create Demo User
    const user = await User.create({
      name: 'Demo User',
      email: 'demo@finsight.com',
      password: 'password123' // Wil be hashed by pre-save middleware
    });

    console.log('Demo User created: demo@finsight.com');

    // Create Transactions
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Generate dates within the current month for a realistic dashboard
    const getDate = (day) => new Date(currentYear, currentMonth, day);

    const transactions = [
      { user: user._id, amount: 5000, type: 'income', category: 'Salary', description: 'Monthly Salary', date: getDate(1) },
      { user: user._id, amount: 1200, type: 'expense', category: 'Housing', description: 'Rent', date: getDate(2), isRecurring: true },
      { user: user._id, amount: 50, type: 'expense', category: 'Utilities', description: 'Internet', date: getDate(5), isRecurring: true },
      { user: user._id, amount: 100, type: 'expense', category: 'Utilities', description: 'Electricity', date: getDate(7), isRecurring: true },
      { user: user._id, amount: 300, type: 'expense', category: 'Food', description: 'Groceries', date: getDate(10) },
      { user: user._id, amount: 150, type: 'expense', category: 'Transport', description: 'Gas', date: getDate(12) },
      { user: user._id, amount: 80, type: 'expense', category: 'Entertainment', description: 'Netflix & Spotify', date: getDate(15), isRecurring: true },
      { user: user._id, amount: 200, type: 'expense', category: 'Food', description: 'Dining Out', date: getDate(18) },
      { user: user._id, amount: 50, type: 'expense', category: 'Health', description: 'Pharmacy', date: getDate(20) },
      { user: user._id, amount: 120, type: 'expense', category: 'Shopping', description: 'New Shoes', date: getDate(22) },
      { user: user._id, amount: 250, type: 'expense', category: 'Food', description: 'Groceries', date: getDate(25) },
      { user: user._id, amount: 400, type: 'expense', category: 'Travel', description: 'Weekend Trip', date: getDate(28) },
    ];

    await Transaction.insertMany(transactions);
    console.log('12 Transactions seeded');

    // Create Budgets
    const budgets = [
      { user: user._id, category: 'Food', limit: 600, month: currentMonth, year: currentYear },
      { user: user._id, category: 'Entertainment', limit: 150, month: currentMonth, year: currentYear },
      { user: user._id, category: 'Shopping', limit: 200, month: currentMonth, year: currentYear },
      { user: user._id, category: 'Transport', limit: 200, month: currentMonth, year: currentYear },
    ];

    await Budget.insertMany(budgets);
    console.log('4 Budgets seeded');

    console.log('Data Import Success!');
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

seedData();
