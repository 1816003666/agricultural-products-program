const { positiveWords, negativeWords } = require('../data/sentimentDict');

const analyzeSentiment = (text) => {
  if (!text || typeof text !== 'string') {
    return { sentiment: 'neutral', score: 0 };
  }

  let positiveCount = 0;
  let negativeCount = 0;

  positiveWords.forEach(word => {
    const regex = new RegExp(word, 'gi');
    const matches = text.match(regex);
    if (matches) positiveCount += matches.length;
  });

  negativeWords.forEach(word => {
    const regex = new RegExp(word, 'gi');
    const matches = text.match(regex);
    if (matches) negativeCount += matches.length;
  });

  const total = positiveCount + negativeCount;
  let score = 0;
  let sentiment = 'neutral';

  if (total > 0) {
    score = (positiveCount - negativeCount) / total;
    if (score > 0.1) {
      sentiment = 'positive';
    } else if (score < -0.1) {
      sentiment = 'negative';
    }
  }

  return {
    sentiment,
    score: Math.round(score * 100) / 100,
    positiveCount,
    negativeCount
  };
};

const calculateHeatIndex = (news, sourceWeight = 1) => {
  const titleWeight = 1.5;
  const sentimentWeight = Math.abs(news.sentimentScore || 0) * 0.5;
  const timeDecay = 1;

  const now = new Date();
  const publishTime = new Date(news.publishTime || now);
  const hoursDiff = (now - publishTime) / (1000 * 60 * 60);
  const timeFactor = Math.max(0.1, 1 - hoursDiff / 72);

  const contentLength = (news.content?.length || 0) / 1000;
  const lengthFactor = Math.min(2, 1 + contentLength * 0.5);

  const heat = (titleWeight + sentimentWeight + lengthFactor) * sourceWeight * timeFactor * 10;

  return Math.round(heat * 10) / 10;
};

module.exports = { analyzeSentiment, calculateHeatIndex };
