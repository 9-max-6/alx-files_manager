import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static getStatus(req, res) {
    res.status(200);
    return res.json({
      redis: redisClient.isAlive(),
      db: dbClient.isAlive(),
    });
  }
  static async getStats(req, res) {
    if (redisClient.isAlive() && dbClient.isAlive()) {
      try {
        const userCollectionCount = await dbClient.nbUsers();
        const fileCollectionCount = await dbClient.nbFiles();
        res.json({
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
