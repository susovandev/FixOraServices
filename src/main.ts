import initApplication from 'app.js';
import { connectDB } from 'config/database.config.js';
import envConfig from 'config/env.config.js';
import Logger from 'config/logger.config.js';

export default async function startServer() {
  const app = initApplication();

  const port = envConfig.PORT;
  const environment = envConfig.NODE_ENV;

  await connectDB();

  app.listen(port, () => {
    Logger.info(`Server running in ${environment} mode on ${port}`);
  });
}

startServer().catch(error => {
  Logger.error(error.message);
  process.exit(1);
});
