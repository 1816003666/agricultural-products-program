const cron = require('node-cron');
const NewsSource = require('../models/NewsSource');
const crawler = require('./newsCrawler');

class CrawlScheduler {
  constructor() {
    this.tasks = new Map();
  }

  async start() {
    try {
      const sources = await NewsSource.find({ status: 'active' });
      sources.forEach(source => {
        this.scheduleTask(source);
      });
      console.log(`Crawl scheduler started with ${sources.length} sources`);
    } catch (err) {
      console.error('Failed to start crawl scheduler:', err);
    }
  }

  scheduleTask(source) {
    if (this.tasks.has(source._id.toString())) {
      this.tasks.get(source._id.toString()).stop();
    }

    try {
      const task = cron.schedule(source.crawlInterval, async () => {
        console.log(`Scheduled crawl for: ${source.name}`);
        try {
          await crawler.crawlSource(source._id, 'schedule');
        } catch (err) {
          console.error(`Scheduled crawl error for ${source.name}:`, err);
        }
      });

      this.tasks.set(source._id.toString(), task);
    } catch (err) {
      console.error(`Failed to schedule task for ${source.name}:`, err);
    }
  }

  stopTask(sourceId) {
    const task = this.tasks.get(sourceId.toString());
    if (task) {
      task.stop();
      this.tasks.delete(sourceId.toString());
    }
  }

  stopAll() {
    this.tasks.forEach(task => task.stop());
    this.tasks.clear();
  }
}

const scheduler = new CrawlScheduler();

module.exports = scheduler;
