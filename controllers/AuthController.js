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
      const { authorization } = req.headers;
      if (!authorization) {
        return res.status(401).json({
          error: 'Unauthorized',
        });
      }
      const credentials = Buffer.from(
        authorization.split(' ')[1],
        'base64',
      ).toString('ascii');

      const email = credentials.split(':')[0];
      const password = credentials.split(':')[1];

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
    (async () => {
      try {
        const result = await redisClient.del(`auth_${token}`);
        if (result === 0) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        return res.status(204).send();
      } catch (e) {
        return res.status(500).json({
          error: 'Internal server error',
        });
      }
    })();
  }

  /**
   * function to retrieve user from the x-token
   */
  static getMe(req, res) {
    (async () => {
      const user = await dbClient.findUser({ _id: new ObjectId(req.user.id) });

      return res.json({
        id: user._id,
        email: user.email,
      });
    })();
  }
}

export default AuthController;
