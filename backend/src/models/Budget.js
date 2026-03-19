const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  category: {
    type: String,
    required: true,
  },
  limit: {
    type: Number,
    required: true,
  },
  month: {
    type: Number, // 0-11 for JS dates
    required: true,
  },
  year: {
    type: Number,
    required: true,
  }
}, {
  timestamps: true,
});

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;
