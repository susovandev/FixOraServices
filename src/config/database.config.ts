import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import envConfig from './env.config.js';
import Logger from './logger.config.js';

let mongoServer: MongoMemoryServer;

export async function connectDB() {
  if (process.env.NODE_ENV === 'test') {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    Logger.info(
      `Testing database host: ${mongoServer?.getUri()}; Connected to database: ${mongoServer?.getUri()}`
    );
  } else {
    const connectionInstance = await mongoose.connect(
      `${envConfig.DATABASE_URI}/${envConfig.DATABASE_NAME}`
    );
    Logger.info(`Database host: ${connectionInstance?.connection.host}`);
    Logger.info(
      `Database connected successfully: ${connectionInstance?.connection.db?.databaseName}`
    );
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
}
