const express = require('express');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const {
  getNewsList,
  getNewsDetail,
  deleteNews,
  getStatistics
} = require('../controllers/newsController');

const router = express.Router();

router.get('/', auth, getNewsList);
router.get('/statistics', auth, getStatistics);
router.get('/:id', auth, getNewsDetail);
router.delete('/:id', auth, requireRole('admin'), deleteNews);

module.exports = router;
