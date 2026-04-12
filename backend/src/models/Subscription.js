const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  name: {
    type: String,
    required: true,
  },
  cost: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    enum: ['Streaming', 'Music', 'Cloud', 'Software', 'Gaming', 'News', 'Fitness', 'Other'],
    default: 'Other',
  },
  renewalDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
