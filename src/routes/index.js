const router = require('express').Router();

router.use('/auth', require('./authRoutes'));
router.use('/products', require('./productRoutes'));
router.use('/upload', require('./uploadRoutes'));

module.exports = router;
