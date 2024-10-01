import dbClient from '../utils/db';

class FileController {
  static postUpload(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      res.status(401);
      res.json({
        error: 'Unauthorized',
      });
    }
    // user
    let currentUser;
    (async () => {
      const userEmail = await redisClient.get('auth_' + token);
      if (!userEmail) {
        res.status(401);
        res.json({
          error: 'Unauthorized',
        });
      }

      const user = await dbClient.findUser(userEmail);
      if (!user) {
        res.status(401);
        res.json({
          error: 'Unauthorized',
        });
      }

      //   reference user
      currentUser = user;
    })();

    // name
    if (!req.params.name) {
      res.status(400).json({
        error: 'Missing name',
      });
    }

    // type
    const types = ['folder', 'file', 'image'];
    if (!req.params.type || !types.includes(req.params.type)) {
      res.status(400).json({
        error: 'Missing type',
      });
    }

    // data
    if (!req.params.data && !req.params.type === 'folder') {
      res.status(400).json({
        error: 'Missing data',
      });
    }

    // parentId set
    if (req.params.parentId) {
      (async () => {
        const parent = await dbClient.findFile(req.params.parentId);
        if (!parent) {
          res.status(400);
          res.json({
            error: 'Parent not found',
          });
        }

        // parent file present
        if (!parent.isFolder) {
          res.status(400);
          res.json({
            error: 'Parent is not a folder',
          });
        }
      })();
    }
  }
}
