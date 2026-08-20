import express from 'express';
import accessRouter from './access/access.route.js';
import cors from 'cors';
const app = express();

app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use('/api/access', accessRouter);

export default app;
