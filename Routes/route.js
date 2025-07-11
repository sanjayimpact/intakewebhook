import express from 'express';
import { intakeWebhook, sendNotificationwebhook } from '../controllers/controller.js';
export const userrouter = express.Router();
userrouter.post('/get',intakeWebhook)
.post('/sendemail',sendNotificationwebhook)

// https://c866220aba9b.ngrok-free.app/api/sendemail