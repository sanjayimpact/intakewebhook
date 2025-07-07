import express from 'express';
import { intakeWebhook } from '../controllers/controller.js';
export const userrouter = express.Router();
userrouter.post('/get',intakeWebhook)
