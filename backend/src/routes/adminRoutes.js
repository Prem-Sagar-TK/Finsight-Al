const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Subscription = require('../models/Subscription');
const { protect, admin } = require('../middleware/authMiddleware');

// Apply protection to all admin routes
router.use(protect);
router.use(admin);

// @desc    Get system stats & health
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    const totalBudgets = await Budget.countDocuments();
    const totalSubscriptions = await Subscription.countDocuments();

    // Volume breakdown
    const txVolume = await Transaction.aggregate([
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      income: { amount: 0, count: 0 },
      expense: { amount: 0, count: 0 },
    };

    txVolume.forEach((vol) => {
      if (vol._id === 'income') {
        stats.income = { amount: vol.total, count: vol.count };
      } else if (vol._id === 'expense') {
        stats.expense = { amount: vol.total, count: vol.count };
      }
    });

    // Recent 5 signups
    const recentUsers = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Health / Server state
    const dbState = mongoose.connection.readyState;
    const dbStates = {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting',
    };

    const serverHealth = {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: dbStates[dbState] || 'Unknown',
    };

    res.json({
      counts: {
        users: totalUsers,
        transactions: totalTransactions,
        budgets: totalBudgets,
        subscriptions: totalSubscriptions,
      },
      volume: stats,
      recentUsers,
      health: serverHealth,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all users with their transaction/budget counts
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    const usersWithCounts = await Promise.all(
      users.map(async (u) => {
        const txCount = await Transaction.countDocuments({ user: u._id });
        const budgetCount = await Budget.countDocuments({ user: u._id });
        const subCount = await Subscription.countDocuments({ user: u._id });
        return {
          ...u.toObject(),
          txCount,
          budgetCount,
          subCount,
        };
      })
    );

    res.json(usersWithCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update a user's role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent demoting self
    if (user._id.toString() === req.user._id.toString() && role !== 'admin') {
      return res.status(400).json({ message: 'You cannot revoke your own admin rights' });
    }

    user.role = role;
    await user.save();

    res.json({
      message: 'User role updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete user & cascade delete their transactions/budgets/subscriptions
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting self
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own administrator account' });
    }

    // Perform cascade deletion
    await Transaction.deleteMany({ user: user._id });
    await Budget.deleteMany({ user: user._id });
    await Subscription.deleteMany({ user: user._id });
    await User.deleteOne({ _id: user._id });

    res.json({ message: 'User and all associated data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
