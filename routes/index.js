import express from 'express';
import AppController from '../controllers/AppController';
import UserController from '../controllers/UsersController';

const router = express.Router();

router.get('/status', (req, res) => {
  AppController.getStatus(req, res);
});

router.get('/stats', (req, res) => {
  AppController.getStats(req, res);
});

router.post('/users', (req, res) => {
  UserController.postNew(req, res);
});
export default router;
