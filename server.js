import express from 'express';
import router from './routes/index';
import setUser from './utils/middleWare';

const app = express();
app.use(express.json());
app.use(setUser);
app.use('/', router);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log('Server running on port:', port);
});
