import redisClient from './redis';
import { ObjectId } from 'mongodb';
import dbClient from './db';

const XMPTED = ['/status', '/stats', '/connect', '/users'];
const preAuthFlow = async (req, res, next) => {
  /**
   * check for the path to ensure that it is exmempt
   * If exempted then call next and exit
   * Otherwise:
   * Check if the auth token is present.
   * Check if the auth token exists
   * Check if the user exists
   * If missing return 401
   *  */

  if (XMPTED.includes(req.path)) {
    return next();
  }

  /**
   * needs authorization and is not a sign-in request
   * check if the request has the X-token header
   * token present check the user id from redis
   * User present set the {user id, user name, user email}
   * */
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

    // at this point I have the user and
    // I can set the user within the request object
    req.user = {};
    req.user.email = user.email;
    req.user.id = user._id;
    next();
  })();
};

export default preAuthFlow;
