import express from 'express';
import {handleVerification, handleCreateAccessCode} from './access.controller.js'

const router = express.Router();

router.post('/create', handleCreateAccessCode);
router.post('/verify', handleVerification);

export default router;
