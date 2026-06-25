const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const {
  getKeywordList,
  createKeyword,
  updateKeyword,
  deleteKeyword
} = require('../controllers/keywordController');

const router = express.Router();

router.get('/', auth, getKeywordList);
router.post('/', auth, requireRole('analyst'), [
  body('word').notEmpty().withMessage('关键词不能为空')
], createKeyword);
router.put('/:id', auth, requireRole('analyst'), updateKeyword);
router.delete('/:id', auth, requireRole('analyst'), deleteKeyword);

module.exports = router;
