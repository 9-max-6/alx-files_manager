import sha1 from 'sha1';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

/**
 * Authcontroller to orcherstrate authentication by interfacing
 * with the dbClient and redisClient
 */
class AuthController {
  static getConnect(req, res) {
    try {
      const authorization = req.headers['authorization'];
      const credentials = Buffer.from(
        authorization.split(' ')[1],
        'base64'
      ).toString('ascii');

      const email = credentials.split(':')[0];
      const password = credentials.split(':')[1];

      try {
        const user = AuthController.findUser(email);
        if (!user) {
          res.status(401);
          res.json({
            error: 'Unauthorized',
          });
        }

        // Checking email
        if (!sha1(password) === user.password) {
          res.status(401);
          res.json({
            error: 'Unauthorized',
          });
        }

        // Storing session
        const token = uuidv4();
        const redisKey = 'auth_' + token;

        // storing in redis with expiration time
        (async () => {
          await redisClient.set(redisKey, user.id.toString(), 86400);
          res.status(200);
          res.json({
            token: token,
          });
        })();
      } catch (e) {
        console.log('Error: ', err.toString());
      }
    } catch (e) {}
  }
  static getDisconnect(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      res.status(401);
      res.json({
        error: 'Unauthorized',
      });
    }

    (async () => {
      await redisClient.del('auth_' + token);
    })();
  }
  /**
   * function to retrieve user from the x-token
   */
  static getMe() {
    const token = req.headers['x-token'];
    if (!token) {
      res.status(401);
      res.json({
        error: 'Unauthorized',
      });
    }

    (async () => {
      const userId = await redisClient.get('auth_' + token);
      if (!userId) {
        res.status(401);
        res.json({
          error: 'Unauthorized',
        });
      }

      const user = await dbClient.findUser({ id: userId });
      if (!user) {
        res.status(401);
        res.json({
          error: 'Unauthorized',
        });
      }

      res.json({
        id: user.id,
        email: user.email,
      });
    })();
  }
}

export default AuthController;
