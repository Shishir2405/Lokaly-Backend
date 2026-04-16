const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

exports.list = asyncHandler(async (req, res) => {
  const {
    q, category, minPrice, maxPrice, seller, sort = 'new',
    page = 1, limit = 20,
  } = req.query;

  const filter = { isActive: true };
  if (category) filter.category = category;
  if (seller) filter.seller = seller;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (q) filter.$text = { $search: q };

  const sortMap = {
    new: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating: { rating: -1, reviewCount: -1 },
    popular: { salesCount: -1 },
  };

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(60, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort(sortMap[sort] || sortMap.new)
      .skip(skip)
      .limit(limitNum)
      .populate('seller', 'name shopName avatar trustScore isVerifiedSeller'),
    Product.countDocuments(filter),
  ]);

  res.json({ items, page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) });
});

exports.getById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('seller', 'name shopName avatar trustScore isVerifiedSeller location');
  if (!product) throw ApiError.notFound('Product not found');
  res.json({ product });
});

exports.create = asyncHandler(async (req, res) => {
  if (req.user.role !== 'seller') throw ApiError.forbidden('Only sellers can create products');
  const payload = { ...req.body, seller: req.user._id };
  const product = await Product.create(payload);
  res.status(201).json({ product });
});

exports.update = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');
  if (String(product.seller) !== String(req.user._id) && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not your product');
  }
  Object.assign(product, req.body);
  await product.save();
  res.json({ product });
});

exports.remove = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');
  if (String(product.seller) !== String(req.user._id) && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not your product');
  }
  product.isActive = false;
  await product.save();
  res.json({ ok: true });
});

exports.mine = asyncHandler(async (req, res) => {
  const items = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
  res.json({ items });
});
