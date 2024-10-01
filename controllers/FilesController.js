/* eslint-disable consistent-return */
/* eslint-disable no-unused-vars */
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import dbClient from '../utils/db';

class FilesController {
  static postUpload(req, res) {
    (async () => {
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

      let parent;
      let localPath;
      // interface with mongoClient
      if (req.body.parentId) {
        parent = await dbClient.findFile(req.body.parentId);
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

      // write to file
      if (req.body.type !== 'folder') {
        const data = Buffer.from(req.body.data, 'base64');

        let rootPath;
        const rootFolder = process.env.FOLDER_PATH || '/tmp/files_manager';
        if (parent) {
          rootPath = `${rootFolder}/${
            parent.localPath ? parent.localPath : ''
          }`;
        } else {
          rootPath = rootFolder;
        }

        try {
          // if the directory is missing make it
          if (!fs.existsSync(rootPath)) {
            fs.mkdirSync(rootPath, { recursive: true });
          }

          localPath = `${rootPath}/${uuidv4().toString()}`;
          fs.writeFile(localPath, data, (err) => {
            if (err) {
              console.log('Error:', err.toString());
              res.status(500);
              return res.json({
                error: 'Error when writing file',
              });
            }
          });
        } catch (e) {
          console.log(e.toString());
        }
      }
      // regardless of type
      const fileObject = {
        userId: req.user.id,
        name: req.body.name,
        type: req.body.type,
        parentId: req.body.parentId ? req.body.parentId : 0,
        isPublic: req.body.isPublic ? req.body.isPublic : false,
        localPath,
      };

      // add file
      const result = await dbClient.addFile(fileObject);
      res.status(201);
      return res.json({
        id: result.insertedId.toString(),
        userId: req.user.id,
        name: req.body.name,
        type: req.body.type,
        parentId: req.body.parentId ? req.body.parentId : 0,
        isPublic: req.body.isPublic ? req.body.isPublic : false,
      });
    })();
  }

  static getShow(req, res) {
    (async () => {
      const file = await dbClient.findFile(req.params.id);

      if (!file) {
        return res.status(404).json({
          error: 'Not found',
        });
      }

      // file found
      return res.status(200).json({ ...file });
    })();
  }

  static getIndex(req, res) {
    (async () => {
      const page = parseInt(req.query.page, 10) || 0;
      const pageSize = 20;
      const parentId = req.query.parentId
        ? new ObjectId(req.query.parentId)
        : 0;

      const pagesToSkip = page * pageSize;
      const files = await dbClient.findFiles(pagesToSkip, pageSize, {
        parentId,
        userId: req.user._id,
      });

      return res.status(200).json({
        page,
        pageSize,
        items: files,
      });
    })();
  }

  static getFile(req, res) {}
}

export default FilesController;
