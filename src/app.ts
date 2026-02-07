import express, { type Application, type Request, type Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import flash from 'connect-flash';

import envConfig from 'config/env.config.js';
import morganMiddleware from 'config/morgan.config.js';
import redisClient from 'config/redis.config.js';
import { REQUEST_BODY_LIMIT, SESSION_MAX_AGE } from 'constants/index.js';
import { notFoundHandler } from 'middlewares/notFound.middleware.js';

export default function initApplication(): Application {
  const app = express();

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],

          imgSrc: ["'self'", 'https://res.cloudinary.com', 'https://ui-avatars.com', 'data:'],

          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://fonts.googleapis.com',
            'https://cdnjs.cloudflare.com',
            'https://cdn.jsdelivr.net',
          ],

          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://cdn.tailwindcss.com',
            'https://cdn.jsdelivr.net',
          ],

          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://cdnjs.cloudflare.com'],
        },
      },
    })
  );

  app.use(morganMiddleware);

  app.use(express.json({ limit: REQUEST_BODY_LIMIT }));
  app.use(express.urlencoded({ extended: true, limit: REQUEST_BODY_LIMIT }));
  app.use(methodOverride('_method'));
  app.use(cookieParser());

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '../views'));
  app.use(express.static(path.join(__dirname, '../public')));

  const isProd = envConfig.NODE_ENV === 'production';
  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      name: 'app_session',
      secret: envConfig.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      rolling: false,
      cookie: {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: SESSION_MAX_AGE,
      },
    })
  );

  app.use(flash());

  app.get('/', (req: Request, res: Response) => {
    return res.render('pages/index', {
      title: 'FixOraService',
      username: 'John Doe',
      user: null,
    });
  });

  app.use(notFoundHandler);

  return app;
}
