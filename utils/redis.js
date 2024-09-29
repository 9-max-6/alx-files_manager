import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();

    this.client.on('error', (err) => {
      console.log('Error in Redis client:', err.toString());
    });

    // Initiate the connection
    this.client.connect().catch((err) => {
      console.error('Failed to connect to Redis:', err);
    });
  }

  // Check if the Redis client is connected
  isAlive() {
    return this.client.isOpen; // In Redis v4, use isOpen instead of connected
  }

  // Get a value by key from Redis
  async get(stringKey) {
    try {
      const result = await this.client.get(stringKey);
      return result;
    } catch (err) {
      console.log('Error getting key from Redis:', err.toString());
      return null; // Return null if an error occurs
    }
  }

  // Set a value with expiration (duration in seconds)
  async set(stringKey, value, duration) {
    try {
      await this.client.set(stringKey, value, {
        EX: duration, // Expiration time in seconds
      });
    } catch (err) {
      console.error('Error setting key in Redis:', err.toString());
    }
  }

  // Delete a key from Redis
  async del(stringKey) {
    try {
      await this.client.del(stringKey);
    } catch (err) {
      console.error('Error deleting key from Redis:', err.toString());
    }
  }
}

// Export an instance of RedisClient
const redisClient = new RedisClient();
export default redisClient;
