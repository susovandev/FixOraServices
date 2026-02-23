import { createClient } from 'redis';

import envConfig from './env.config.js';
import Logger from './logger.config.js';

const redisClient = createClient({
  socket: {
    host: envConfig.REDIS_HOST,
    port: Number(envConfig.REDIS_PORT),
  },
  password: envConfig.REDIS_PASSWORD,
});

redisClient.on('connect', () => {
  Logger.info('Redis connected successfully');
});

redisClient.on('error', err => {
  Logger.error(`Redis connection error: ${err}`);
  process.exit(1);
});

await redisClient.connect();

export default redisClient;
