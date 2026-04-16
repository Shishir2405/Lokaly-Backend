const router = require('express').Router();
const ctrl = require('../controllers/coinsController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.get('/ledger', ctrl.myLedger);
router.post('/redeem', ctrl.redeem);

module.exports = router;
