import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import accessRouter from './access/access.route.js';

const app = express();

app.disable('x-powered-by');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://unpkg.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://avatars.githubusercontent.com", "https://*.basemaps.cartocdn.com"],
      connectSrc: ["'self'", "ws:", "wss:"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: process.env.ORIGIN || "http://localhost:5173",
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'x-admin-secret'],
}));

app.set('trust proxy', 1);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests' },
});
app.use('/api', globalLimiter);

app.use('/api/access', accessRouter);

app.use((err, _req, res, _next) => {
  console.error(`[Error] Unhandled: ${err.message}`);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

export default app;
