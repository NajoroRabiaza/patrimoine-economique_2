const express = require('express');
const router = express.Router();
const { getValeurPatrimoine, getValeurPatrimoineRange } = require('../controllers/patrimoineController');

router.get('/:date', getValeurPatrimoine);
router.post('/range', getValeurPatrimoineRange);

module.exports = router;