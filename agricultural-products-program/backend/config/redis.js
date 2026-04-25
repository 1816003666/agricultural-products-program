const redis = require('redis');

// 创建Redis客户端
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// 连接Redis
redisClient.connect().catch(console.error);

// 缓存操作函数
const cache = {
  // 设置缓存
  async set(key, value, expiration = 3600) {
    try {
      await redisClient.set(key, JSON.stringify(value), {
        EX: expiration
      });
      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  },
  
  // 获取缓存
  async get(key) {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  },
  
  // 删除缓存
  async del(key) {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('Redis del error:', error);
      return false;
    }
  },
  
  // 清除所有缓存
  async clear() {
    try {
      await redisClient.flushAll();
      return true;
    } catch (error) {
      console.error('Redis clear error:', error);
      return false;
    }
  }
};

module.exports = cache;