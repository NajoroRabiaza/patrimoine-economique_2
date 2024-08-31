const express = require('express');
const router = express.Router();
const { getPossessions, createPossession, updatePossession, closePossession } = require('../controllers/possessionController');

router.get('/', getPossessions);
router.post('/', createPossession);
router.put('/:libelle', updatePossession);
router.patch('/:libelle/close', closePossession);

module.exports = router;