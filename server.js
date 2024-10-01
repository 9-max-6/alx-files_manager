import express from 'express';
import router from './routes/index';
import preAuthFlow from './utils/middleWare';

const app = express();
app.use(express.json());
app.use(preAuthFlow);
app.use('/', router);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log('Server running on port:', port);
});
