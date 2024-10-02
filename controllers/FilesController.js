/* eslint-disable consistent-return */
/* eslint-disable no-unused-vars */
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { lookup } from 'mime-types';
import dbClient from '../utils/db';

class FilesController {
  /**
   *
   * @param {request} req
   * @param {Response} res
   * @returns file uploaded
   */
  static async postUpload(req, res) {
    // name
    if (!req.body.name) {
      res.status(400).json({
        error: 'Missing name',
      });
    }

    // type
    const fileTypes = ['folder', 'file', 'image'];
    if (!req.body.type || !fileTypes.includes(req.body.type)) {
      return res.status(400).json({
        error: 'Missing type',
      });
    }

    // data
    if (!req.body.data && req.body.type !== 'folder') {
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
      if (parent.type !== 'folder') {
        res.status(400);
        return res.json({
          error: 'Parent is not a folder',
        });
      }
    }

    // write to file
    if (req.body.type !== 'folder') {
      const data = Buffer.from(req.body.data, 'base64');

      const rootPath = process.env.FOLDER_PATH || '/tmp/files_manager';
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
        return res.status(500).json({
          error: 'Internal server error',
        });
      }
    }

    // regardless of type
    const fileObject = {
      userId: req.user.id,
      name: req.body.name,
      type: req.body.type,
      parentId: req.body.parentId ? new ObjectId(req.body.parentId) : 0,
      isPublic: req.body.isPublic ? req.body.isPublic : false,
      localPath,
    };

    try {
      // add file
      const result = await dbClient.addFile(fileObject);
      res.status(201);
      return res.json({
        id: result.insertedId.toString(),
        userId: req.user.id.toString(),
        name: req.body.name,
        type: req.body.type,
        parentId: req.body.parentId ? req.body.parentId : 0,
        isPublic: req.body.isPublic ? req.body.isPublic : false,
      });
    } catch (e) {
      console.log(e.toString());
      return res.status(500).json({
        error: 'Internal server error occurred',
      });
    }
  }

  /**
   *
   * @param {request} req
   * @param {Response} res
   * @returns file if it exists
   */
  static async getShow(req, res) {
    try {
      const file = await dbClient.findFile(req.params.id);
      if (!file) {
        return res.status(404).json({
          error: 'Not foound',
        });
      }

      if (file.userId.toString() !== req.user.id.toString()) {
        return res.status(404).json({
          error: 'Not fouund',
        });
      }
      // file found
      return res.status(200).json({
        id: file._id.toString(),
        userId: file.userId.toString(),
        name: file.name,
        type: file.type,
        parentId: file.parentId.toString(),
        isPublic: file.isPublic,
      });
    } catch (e) {
      console.log('Error when finding file:', e.toString());
    }
  }

  /**
   *
   * @param {request} req
   * @param {Response} res
   * @returns paginated results
   */
  static async getIndex(req, res) {
    const page = parseInt(req.query.page, 10) || 0;
    const pageSize = 20;
    const parentId = req.query.parentId ? new ObjectId(req.query.parentId) : 0;

    const pagesToSkip = page * pageSize;
    const files = await dbClient.findFiles(pagesToSkip, pageSize, {
      parentId,
      userId: req.user.id,
    });

    return res.status(200).json(files);
  }
  /**
   *
   * @param {request} req
   * @param {Response} res
   * @returns published file
   */
  static async putPublish(req, res) {
    const exists = await dbClient.findFile(req.params.id);
    if (!exists) {
      return res.status(404).json({
        error: 'Not found',
      });
    }

    // checking if the current user is the owner of the file.
    if (exists.userId.toString() !== req.user.id.toString()) {
      return res.status(404).json({
        error: 'Not found',
      });
    }
    // file is present so attempting to update value in db.
    const filter = { _id: new ObjectId(req.params.id) };
    const update = { $set: { isPublic: true } };
    const result = await dbClient.updateFile(filter, update);
    if (!result) {
      return res.status(500).json({
        error: 'Internal server error occurred.',
      });
    }
    // file properties successfully set, heading back
    // retrieving new file
    const newFile = await dbClient.findFile(req.params.id);
    return res.status(200).json({ ...newFile });
  }
  /**
   *
   * @param {request} req
   * @param {Response} res
   * @returns unpublished file
   */
  static async putUnpublish(req, res) {
    const exists = await dbClient.findFile(req.params.id);
    if (!exists) {
      return res.status(404).json({
        error: 'Not found',
      });
    }

    // checking if the current user is the owner of the file.
    if (exists.userId !== req.user.id) {
      return res.status(404).json({
        error: 'Not found',
      });
    }
    // file is present so attempting to update value in db.
    const filter = { _id: new ObjectId(req.params.id) };
    const update = { $set: { isPublic: false } };
    const result = await dbClient.updateFile(filter, update);
    if (!result) {
      return res.status(500).json({
        error: 'Internal server error occurred.',
      });
    }
    // file properties successfully set, heading back
    // retrieving new file
    const newFile = await dbClient.findFile(req.params.id);
    return res.status(200).json({ ...newFile });
  }

  static async getFile(req, res) {
    const fileId = req.params.id;

    // attempt to find the file
    const result = dbClient.findFile(fileId);
    if (!result) {
      return res.status(404).json({
        error: 'Not found',
      });
    }

    // check if the file isPublic
    if (!result.isPublic) {
      // check if the user is authenticated
      if (!req.user) {
        // if not authenticated return the response
        return res.status(404).json({
          error: 'Not found',
        });
      }

      // check if the authenticated user is the owner of the file.
      if (result.userId !== req.user.id) {
        // not found error since the file is not public and the current
        // user is not owner
        return res.status(404).json({
          error: 'Not found',
        });
      }
    }

    /**
     * at this point the current user is either the owner of the file
     * or the file ispublic and so everyone has access to it.
     */

    // checking the file type
    if (result.type === 'folder') {
      return res.status(400).json({
        error: "A folder doesn't have a type",
      });
    }

    // checking if the file exists locally
    if (!fs.existsSync(result.localPath)) {
      // if file doesn' exists return 404
      return res.status(404).json({
        error: 'Not found',
      });
    }

    /**
     * if the file exists, use the mime-types module to generate
     * a response to the client.
     */
    const mimeType = lookup(result.name);
    if (mimeType) {
      res.setHeader('Content-Type', mimeType);
    }

    // reading the file
    try {
      const fileStream = fs.createReadStream(result.localPath);
      fileStream.pipe(res);
    } catch (e) {
      console.log('Error when reading file.', e.toString());
    }
  }
}

export default FilesController;
