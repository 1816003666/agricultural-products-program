const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: '请求过于频繁，请稍后再试'
});
app.use('/api', limiter);

app.get('/api/health', (req, res) => {
  res.json({ code: 0, message: 'OK', data: { status: 'healthy' } });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/news', require('./routes/newsRoutes'));
app.use('/api/keywords', require('./routes/keywordRoutes'));
app.use('/api/sources', require('./routes/sourceRoutes'));
app.use('/api/crawl', require('./routes/crawlRoutes'));
app.use('/api/analysis', require('./routes/analysisRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

app.use(errorHandler);

module.exports = app;
