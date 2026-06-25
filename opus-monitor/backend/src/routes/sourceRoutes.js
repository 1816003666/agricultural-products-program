const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const {
  getSourceList,
  createSource,
  updateSource,
  deleteSource
} = require('../controllers/sourceController');

const router = express.Router();

router.get('/', auth, getSourceList);
router.post('/', auth, requireRole('admin'), [
  body('name').notEmpty().withMessage('名称不能为空'),
  body('url').notEmpty().withMessage('URL不能为空')
], createSource);
router.put('/:id', auth, requireRole('admin'), updateSource);
router.delete('/:id', auth, requireRole('admin'), deleteSource);

module.exports = router;
