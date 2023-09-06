import dotenv from 'dotenv'

import { createClient } from 'redis';
import util from 'util';
dotenv.config();
const client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
        reconnectStrategy: retries => Math.min(retries * 50, 1000)
    },
});


client.on('connect', () => {
    // eslint-disable-next-line
    console.log('Connected to redis server');
    return;
});

client.on('error', (error) => {
    // eslint-disable-next-line
    console.log(`Redis server error: ${error}`);
    return;
});

export default client;