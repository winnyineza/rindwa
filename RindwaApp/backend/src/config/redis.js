const redis = require('redis');
const { promisify } = require('util');

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.client = redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            return new Error('The server refused the connection');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Retry time exhausted');
          }
          if (options.attempt > 10) {
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        },
      });

      // Promisify Redis commands
      this.get = promisify(this.client.get).bind(this.client);
      this.set = promisify(this.client.set).bind(this.client);
      this.del = promisify(this.client.del).bind(this.client);
      this.exists = promisify(this.client.exists).bind(this.client);
      this.expire = promisify(this.client.expire).bind(this.client);
      this.ttl = promisify(this.client.ttl).bind(this.client);
      this.incr = promisify(this.client.incr).bind(this.client);
      this.decr = promisify(this.client.decr).bind(this.client);
      this.hget = promisify(this.client.hget).bind(this.client);
      this.hset = promisify(this.client.hset).bind(this.client);
      this.hdel = promisify(this.client.hdel).bind(this.client);
      this.hgetall = promisify(this.client.hgetall).bind(this.client);
      this.lpush = promisify(this.client.lpush).bind(this.client);
      this.rpop = promisify(this.client.rpop).bind(this.client);
      this.lrange = promisify(this.client.lrange).bind(this.client);
      this.sadd = promisify(this.client.sadd).bind(this.client);
      this.srem = promisify(this.client.srem).bind(this.client);
      this.smembers = promisify(this.client.smembers).bind(this.client);
      this.sismember = promisify(this.client.sismember).bind(this.client);

      // Event handlers
      this.client.on('connect', () => {
        console.log('✅ Redis client connected');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        console.log('✅ Redis client ready');
      });

      this.client.on('error', (err) => {
        console.error('❌ Redis client error:', err);
        this.isConnected = false;
      });

      this.client.on('end', () => {
        console.log('🔌 Redis client disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
      return true;
    } catch (error) {
      console.error('❌ Redis connection failed:', error.message);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.client) {
        await this.client.quit();
        this.isConnected = false;
        console.log('✅ Redis client disconnected');
      }
    } catch (error) {
      console.error('❌ Error disconnecting Redis:', error.message);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    try {
      if (!this.isConnected) {
        return {
          status: 'unhealthy',
          error: 'Not connected to Redis',
          connection: 'inactive',
        };
      }

      await this.ping();
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        connection: 'active',
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        connection: 'inactive',
      };
    }
  }

  // Ping Redis
  async ping() {
    return await this.client.ping();
  }

  // Cache methods with TTL
  async setWithTTL(key, value, ttl = 3600) {
    try {
      await this.set(key, JSON.stringify(value));
      await this.expire(key, ttl);
      return true;
    } catch (error) {
      console.error('Error setting cache with TTL:', error);
      return false;
    }
  }

  async getCached(key) {
    try {
      const value = await this.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error getting cached value:', error);
      return null;
    }
  }

  // Session management
  async setSession(sessionId, sessionData, ttl = 86400) {
    return await this.setWithTTL(`session:${sessionId}`, sessionData, ttl);
  }

  async getSession(sessionId) {
    return await this.getCached(`session:${sessionId}`);
  }

  async deleteSession(sessionId) {
    return await this.del(`session:${sessionId}`);
  }

  // Rate limiting
  async incrementRateLimit(key, ttl = 60) {
    const count = await this.incr(key);
    if (count === 1) {
      await this.expire(key, ttl);
    }
    return count;
  }

  async getRateLimit(key) {
    return await this.get(key) || 0;
  }

  // User online status
  async setUserOnline(userId) {
    return await this.setWithTTL(`online:${userId}`, { timestamp: Date.now() }, 300);
  }

  async isUserOnline(userId) {
    return await this.exists(`online:${userId}`);
  }

  async setUserOffline(userId) {
    return await this.del(`online:${userId}`);
  }
}

// Create singleton instance
const redisClient = new RedisClient();

// Connect function for server startup
async function connectRedis() {
  try {
    await redisClient.connect();
    return true;
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    // Don't throw error for development - Redis might not be available
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    return false;
  }
}

module.exports = {
  redisClient,
  connectRedis,
}; 