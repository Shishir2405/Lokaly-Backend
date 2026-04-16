const router = require('express').Router();
const ctrl = require('../controllers/mlController');

router.get('/health', ctrl.health);
router.get('/sentiment', ctrl.sentiment);
router.post('/sentiment', ctrl.sentiment);
router.post('/embed', ctrl.embed);

module.exports = router;
