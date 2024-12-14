import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { getUserData } from '../controllers/userController.js';

//router for userRouter
const userRouter = express.Router();

//userRouter end point
userRouter.get('/data', userAuth, getUserData);

export default userRouter;