const router = require('express').Router();

router.use('/auth', require('./authRoutes'));
router.use('/products', require('./productRoutes'));
router.use('/upload', require('./uploadRoutes'));
router.use('/posts', require('./postRoutes'));

module.exports = router;
