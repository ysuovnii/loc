import express from 'express';
import {handleCreation, handleVerification} from './access.controller.js';
import validateAccessCode from './access.middleware.js';
const router = express.Router();

router.post('/create', handleCreation);
router.post('/verify', validateAccessCode, handleVerification);

export default router;
