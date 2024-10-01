/* eslint-disable consistent-return */
import sha1 from 'sha1';
import dbClient from '../utils/db';
/**
 * UserController class to access and retrieve
 * users from storage
 */
class UserController {
  /**
   * A function to add a new user to the database
   * @param {response object from Node} res
   * @param {request object from Node} req
   */
  static postNew(req, res) {
    const { email } = req.body;
    const { password } = req.body;

    if (!email) {
      res.status(400);
      res.json({ error: 'Missing email' });
    }
    if (!password) {
      res.status(400);
      return res.json({ error: 'Missing password' });
    }
    const hashedP = sha1(password);
    (async () => {
      try {
        const id = await dbClient.addNewUser(email, hashedP);
        if (!id) {
          res.status(400);
          return res.json({
            error: 'Already exist',
          });
        }
        res.status(201);
        return res.json({
          id,
          email,
        });
      } catch (e) {
        console.log(e.toString());
      }
    })();
  }
}

export default UserController;
