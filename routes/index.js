import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

const router = express.Router();

router.get('/status', (req, res) => {
  AppController.getStatus(req, res);
});

router.get('/stats', (req, res) => {
  AppController.getStats(req, res);
});

router.post('/users', (req, res) => {
  UsersController.postNew(req, res);
});

router.get('/connect', (req, res) => {
  AuthController.getConnect(req, res);
});

router.get('/disconnect', (req, res) => {
  AuthController.getDisconnect(req, res);
});

router.get('/users/me', (req, res) => {
  AuthController.getMe(req, res);
});

router.post('/files', (req, res) => {
  FilesController.postUpload(req, res);
});

router.get('/files', (req, res) => {
  FilesController.getIndex(req, res);
});
router.get('/files/:id', (req, res) => {
  FilesController.getShow(req, res);
});
export default router;
