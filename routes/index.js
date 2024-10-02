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

router.post('/users', (req, res) => UsersController.postNew(req, res));
router.get('/connect', async (req, res) => {
  await AuthController.getConnect(req, res);
});

router.get('/disconnect', async (req, res) => {
  await AuthController.getDisconnect(req, res);
});

router.get('/users/me', async (req, res) => {
  await AuthController.getMe(req, res);
});

router.post('/files', async (req, res) => {
  await FilesController.postUpload(req, res);
});

router.get('/files', async (req, res) => {
  await FilesController.getIndex(req, res);
});
router.get('/files/:id', async (req, res) => {
  await FilesController.getShow(req, res);
});
router.put('/files/:id/publish', async (req, res) => {
  await FilesController.putPublish(req, res);
});
router.put('/files/:id/unpublish', (req, res) => {
  FilesController.putUnpublish(req, res);
});
export default router;
