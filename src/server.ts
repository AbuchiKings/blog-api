import dotenv from 'dotenv';

import App from './app';

import validateEnv from './utils/validateEnv';

import PostController from './controllers/PostController';
import UserController from './controllers/UserController';


dotenv.config();

validateEnv();

const app = new App([new UserController(), new PostController()], Number(process.env.PORT));
app.listen();