import dbClient from '../utils/db';
import { ObjectId } from 'mongodb';
import redisClient from '../utils/redis';

class FilesController {
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

      // reference user
      currentUser = user;

      // name
      if (!req.body.name) {
        res.status(400).json({
          error: 'Missing name',
        });
      }

      // type
      const types = ['folder', 'file', 'image'];
      if (!req.body.type || !types.includes(req.body.type)) {
        return res.status(400).json({
          error: 'Missing type',
        });
      }

      // data
      if (!req.body.data && !req.body.type === 'folder') {
        return res.status(400).json({
          error: 'Missing data',
        });
      }

      // interface with mongoClient
      if (req.body.parentId) {
        const parent = await dbClient.findFile(req.body.parentId);
        if (!parent) {
          res.status(400);
          return res.json({
            error: 'Parent not found',
          });
        }
        // parent file not folder
        if (!parent.type === 'folder') {
          res.status(400);
          return res.json({
            error: 'Parent is not a folder',
          });
        }
      }

      // regardless of type
      const fileObject = {
        userId: currentUser._id,
        name: req.body.name,
        type: req.body.type,
        parentId: req.body.parentId ? req.body.parentId : 0,
        isPublic: req.body.isPublic ? req.body.isPublic : false,
        localPath: req.body.localPath,
      };

      // add file
      const id = await dbClient.addFile(fileObject).insertId;

      // write to file
      if (!req.body.type === 'folder') {
        const data = Buffer.from(data, 'base64').toString('utf-8');
        console.log(data);
        fs.writeFile(req.body.localPath, data, (err) => {
          if (err) {
            res.status(500);
            return res.json({
              error: 'Error when writing file',
            });
          }
        });
      }

      res.status(201);
      return res.json({
        id: id,
        ...fileObject,
      });
    })();
  }
}

export default FilesController;
