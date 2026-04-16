const router = require('express').Router();

router.use('/auth', require('./authRoutes'));
router.use('/products', require('./productRoutes'));
router.use('/upload', require('./uploadRoutes'));
router.use('/posts', require('./postRoutes'));
router.use('/cart', require('./cartRoutes'));
router.use('/orders', require('./orderRoutes'));
router.use('/payments', require('./paymentRoutes'));
router.use('/chat', require('./chatRoutes'));
router.use('/live', require('./liveRoutes'));
router.use('/reviews', require('./reviewRoutes'));
router.use('/trust', require('./trustRoutes'));
router.use('/coins', require('./coinsRoutes'));
router.use('/referrals', require('./referralRoutes'));

module.exports = router;
