import express from 'express';
import accessRouter from './access/access.route.js';
const app = express();

app.use(express.json());
app.use('/api/access', accessRouter);

export default app;
