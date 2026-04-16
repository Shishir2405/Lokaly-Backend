const User = require('../models/User');
const CoinLedger = require('../models/CoinLedger');

async function award(userId, delta, reason, meta = {}) {
  const user = await User.findById(userId);
  if (!user) throw new Error('user not found');
  user.coins = Math.max(0, (user.coins || 0) + delta);
  await user.save();
  await CoinLedger.create({ user: userId, delta, reason, meta, balanceAfter: user.coins });
  return user.coins;
}

async function ledger(userId, { limit = 50 } = {}) {
  return CoinLedger.find({ user: userId }).sort({ createdAt: -1 }).limit(limit);
}

module.exports = { award, ledger };
