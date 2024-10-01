/* eslint-disable consistent-return */
import sha1 from 'sha1';
import { ObjectId } from 'mongodb';
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
      const { email, password } = req.user;

      try {
        (async () => {
          const user = await dbClient.findUser({ email });
          if (!user) {
            res.status(401);
            return res.json({
              error: 'Unauthorized',
            });
          }

          // Checking email
          if (!sha1(password) === user.password) {
            res.status(401);
            return res.json({
              error: 'Unauthorized',
            });
          }

          // Storing session
          const token = uuidv4();
          const redisKey = `auth_${token}`;
          (async () => {
            await redisClient.set(redisKey, user._id.toString(), 86400);
            res.status(200);
            return res.json({
              token,
            });
          })();
        })();
      } catch (e) {
        console.log('Error: ', e.toString());
      }
    } catch (e) {
      console.log('Error:', e.toString());
      return res.status(500);
    }
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
      await redisClient.del(`auth_${token}`);
    })();
  }

  /**
   * function to retrieve user from the x-token
   */
  static getMe(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      res.status(401);
      return res.json({
        error: 'Unauthorized',
      });
    }

    (async () => {
      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) {
        res.status(401);
        return res.json({
          error: 'Unauthorized',
        });
      }

      const user = await dbClient.findUser({ _id: new ObjectId(userId) });
      if (!user) {
        res.status(401);
        return res.json({
          error: 'Unauthorized',
        });
      }

      return res.json({
        id: user._id,
        email: user.email,
      });
    })();
  }
}

export default AuthController;
