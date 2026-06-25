const express = require('express');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const {
  triggerCrawl,
  getTaskList,
  getTaskDetail
} = require('../controllers/crawlController');

const router = express.Router();

router.post('/trigger', auth, requireRole('analyst'), triggerCrawl);
router.get('/tasks', auth, getTaskList);
router.get('/tasks/:id', auth, getTaskDetail);

module.exports = router;
