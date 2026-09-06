import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { handleCreation, handleVerification, handleGetHistory } from './access.controller.js';
import validateAccessCode from './access.middleware.js';

const router = express.Router();

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
});

const adminAuth = (req, res, next) => {
  const adminSecret = req.headers['x-admin-secret'];

  if (!adminSecret || adminSecret !== process.env.ADMIN_CREATE_SECRET) {
    console.warn(`[Security] Unauthorized room creation attempt from ${req.ip}`);
    return res.status(403).json({
      success: false,
      message: 'Forbidden',
    });
  }

  next();
};

router.post('/create', adminAuth, handleCreation);
router.post('/verify', verifyLimiter, validateAccessCode, handleVerification);
router.get('/history', handleGetHistory);

export default router;

