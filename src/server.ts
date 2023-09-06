import dotenv from 'dotenv';

import App from './app';

import validateEnv from './utils/validateEnv';

dotenv.config();

validateEnv();

const app = new App([], Number(process.env.PORT));
app.listen();