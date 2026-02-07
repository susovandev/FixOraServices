import dotenv from 'dotenv';

const nodeEnv = process.env.NODE_ENV ?? 'development';

dotenv.config({
  path: `.env.${nodeEnv}`,
});

const _envConfig = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  APP_NAME: process.env.APP_NAME,
  SESSION_SECRET: process.env.SESSION_SECRET,

  DATABASE_URI: process.env.DATABASE_URI,
  DATABASE_NAME: process.env.DATABASE_NAME,

  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};

export default Object.freeze(_envConfig);
