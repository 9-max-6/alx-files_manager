import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  /**
   *
   * @param {request object} req
   * @param {response object} res
   * @returns connection status of the redis and mongoDB clients
   */
  static getStatus(req, res) {
    res.status(200);
    return res.json({
      redis: redisClient.isAlive(),
      db: dbClient.isAlive(),
    });
  }
  /**
   *
   * @param {request object} req
   * @param {response object} res
   * @returns object with the document count in the
   * users and files collections.
   */
  static async getStats(req, res) {
    if (redisClient.isAlive() && dbClient.isAlive()) {
      try {
        const userCollectionCount = await dbClient.nbUsers();
        const fileCollectionCount = await dbClient.nbFiles();
        return res.json({
          users: userCollectionCount,
          files: fileCollectionCount,
        });
      } catch (err) {
        console.log(err.toString());
      }
    }
  }
}

export default AppController;
