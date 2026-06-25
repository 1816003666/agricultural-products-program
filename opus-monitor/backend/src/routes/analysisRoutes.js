const express = require('express');
const auth = require('../middleware/auth');
const {
  getSentimentTrend,
  getHeatRanking,
  getSourceDistribution,
  getWordCloud,
  getCategoryStats
} = require('../controllers/analysisController');

const router = express.Router();

router.use(auth);

router.get('/sentiment-trend', getSentimentTrend);
router.get('/heat-ranking', getHeatRanking);
router.get('/source-distribution', getSourceDistribution);
router.get('/word-cloud', getWordCloud);
router.get('/category-stats', getCategoryStats);

module.exports = router;
