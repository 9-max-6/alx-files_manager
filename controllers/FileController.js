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

      // reference user
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

    // interface with mongClient
    (async () => {
      let parent;

      if (req.params.parentId) {
        parent = await dbClient.findFile(req.params.parentId);
      }
      if (!parent) {
        res.status(400);
        res.json({
          error: 'Parent not found',
        });
      }

      // parent file not folder
      if (!parent.isFolder) {
        res.status(400);
        res.json({
          error: 'Parent is not a folder',
        });
      }

      // if type is folder
      const fileObject = {
        userId: currentUser.id,
        name: req.params.name,
        type: req.params.type,
        parentId: req.params.parentId,
        isPublic: req.params.isPublic ? req.params.isPublic : false,
        localPath: req.params.localPath,
      };

      const id = await dbClient.addFile(fileObject);

      if (req.params.type != 'folder') {
        const data = Buffer.from(data, 'base64').toString('utf-8');
        fs.writeFile(req.params.localPath, data, (err) => {
          if (err) {
            res.status(500);
            res.json({
              error: 'Error when writing file',
            });
          }
        });
      }

      res.json({
        id: id,
        ...fileObject,
      });
    })();
  }
}
