import express from 'express';
import { queryChatbot } from '../controllers/chatbotController.js';
import { optionalProtect } from '../middleware/auth.js';

const router = express.Router();

router.post('/message', optionalProtect, queryChatbot);

export default router;
