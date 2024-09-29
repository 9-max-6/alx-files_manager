import { createClient } from 'redis';
import { promisify } from 'util';

/**
 * RedisClient class to interface with the redis-server
 */
class RedisClient {
  /**
   * Constructor to create a new redis-client and
   * define the variable isOpen
   */
  constructor() {
    this.client = createClient();
    this.isOpen = false;
    this.client
      .on('error', (err) => {
        console.log('Error in Redis client:', err.toString());
      })
      .on('connect', () => {
        this.isOpen = true;
      });
  }

  /**
   * Checks if the redis.client.connect event was emitted
   * @returns this.isOpen
   */
  isAlive() {
    return this.isOpen;
  }

  /**
   *
   * @param {Key to retrieve the value of from the redis store} stringKey
   * @returns the value of the key in store or null in case of an error
   */
  async get(stringKey) {
    try {
      const result = promisify(this.client.GET).bind(this.client)(stringKey);
      return result;
    } catch (err) {
      console.log('Error getting key from Redis:', err.toString());
      return null;
    }
  }

  /**
   *
   * @param {string key} stringKey
   * @param {value to set in the key} value
   * @param {duration to expiration} duration
   */
  async set(stringKey, value, duration) {
    try {
      await promisify(this.client.SETEX).bind(this.client)(
        stringKey,
        duration,
        value,
      );
    } catch (err) {
      console.error('Error setting key in Redis:', err.toString());
    }
  }

  /**
   * function to delete a value from the redis-store
   * @param {key of value to remove from the store} stringKey
   */
  async del(stringKey) {
    try {
      await promisify(this.client.DEL).bind(this.client)(stringKey);
    } catch (err) {
      console.error('Error deleting key from Redis:', err.toString());
    }
  }
}

const redisClient = new RedisClient();
export default redisClient;
