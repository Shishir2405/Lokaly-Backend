const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const env = require('../config/env');

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });
}

exports.signup = asyncHandler(async (req, res) => {
  const { name, email, password, role, shopName, shopCategory, referralCode } = req.body || {};
  if (!name || !email || !password) throw ApiError.badRequest('name, email, password required');
  if (password.length < 6) throw ApiError.badRequest('password must be >= 6 chars');

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw ApiError.conflict('Email already registered');

  let referredBy = null;
  if (referralCode) {
    const inviter = await User.findOne({ referralCode: referralCode.toUpperCase() });
    if (inviter) referredBy = inviter._id;
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash: password,
    role: ['buyer', 'seller'].includes(role) ? role : 'buyer',
    shopName: role === 'seller' ? shopName : undefined,
    shopCategory: role === 'seller' ? shopCategory : undefined,
    referredBy,
  });

  // If a seller signs up with a referral code, create the referral tracking row.
  if (referredBy && user.role === 'seller') {
    try {
      const { registerReferral } = require('../services/referralService');
      await registerReferral({ referrerId: referredBy, referredSellerId: user._id });
    } catch (_) { /* non-fatal */ }
  }

  const token = signToken(user);
  res.status(201).json({ token, user: user.toPublic() });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) throw ApiError.badRequest('email and password required');

  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user || !user.isActive) throw ApiError.unauthorized('Invalid credentials');

  const ok = await user.verifyPassword(password);
  if (!ok) throw ApiError.unauthorized('Invalid credentials');

  user.lastSeenAt = new Date();
  await user.save();

  const token = signToken(user);
  res.json({ token, user: user.toPublic() });
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toPublic() });
});

exports.logout = asyncHandler(async (_req, res) => {
  // JWT is stateless — client drops the token. Hook here for future revocation list.
  res.json({ ok: true });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const updatable = ['name', 'bio', 'avatar', 'phone', 'location', 'language', 'shopName', 'shopCategory'];
  for (const key of updatable) if (key in req.body) req.user[key] = req.body[key];
  await req.user.save();
  res.json({ user: req.user.toPublic() });
});
