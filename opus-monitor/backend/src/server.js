const app = require('./app');
const config = require('./config');
const connectDB = require('./config/database');
const scheduler = require('./crawler/crawlScheduler');

const startServer = async () => {
  try {
    await connectDB();
    await scheduler.start();
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
