const Transaction = require('../models/Transaction');
const fs = require('fs');
const csv = require('csv-parser');

// @desc    Get all transactions for user
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a transaction
// @route   POST /api/transactions
// @access  Private
const addTransaction = async (req, res) => {
  try {
    const { amount, type, category, description, date, isRecurring } = req.body;

    const transaction = await Transaction.create({
      user: req.user.id,
      amount,
      type,
      category,
      description,
      date: date || Date.now(),
      isRecurring: isRecurring || false,
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await transaction.deleteOne();

    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload transactions via CSV
// @route   POST /api/transactions/upload
// @access  Private
const uploadTransactionsCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a CSV file' });
    }

    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        // Remove file after reading
        fs.unlinkSync(req.file.path);

        const transactionsToInsert = results.map((row) => ({
          user: req.user.id,
          amount: parseFloat(row.amount),
          type: row.type && row.type.toLowerCase() === 'income' ? 'income' : 'expense',
          category: row.category || 'Other',
          description: row.description || '',
          date: row.date ? new Date(row.date) : Date.now(),
          isRecurring: row.isRecurring && row.isRecurring.toLowerCase() === 'true',
        })).filter(t => !isNaN(t.amount));

        if (transactionsToInsert.length === 0) {
           return res.status(400).json({ message: 'No valid transactions found in CSV' });
        }

        const inserted = await Transaction.insertMany(transactionsToInsert);
        res.status(201).json(inserted);
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  uploadTransactionsCSV,
};
