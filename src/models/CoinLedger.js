const mongoose = require('mongoose');

const COIN_REASONS = [
  'review', 'helpful_answer', 'live_spin', 'live_game',
  'order_reward', 'referral_bonus', 'equity_cashback',
  'order_redeem', 'admin_adjust',
];

const coinLedgerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  delta: { type: Number, required: true }, // +earn / -redeem
  reason: { type: String, enum: COIN_REASONS, required: true },
  meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  balanceAfter: Number,
}, { timestamps: true });

coinLedgerSchema.index({ user: 1, createdAt: -1 });
coinLedgerSchema.statics.REASONS = COIN_REASONS;

module.exports = mongoose.model('CoinLedger', coinLedgerSchema);
