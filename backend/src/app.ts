import cors from 'cors';
import express from 'express';

import { pool } from './db/pool.js';
import { config } from './config.js';
import { errorHandler } from './middleware/error-handler.js';
import { countriesRouter } from './routes/countries.routes.js';
import { regionsRouter } from './routes/regions.routes.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());

  app.get(
    '/api/health',
    async (_req, res, next) => {
      try {
        await pool.query('SELECT 1');
        res.json({ status: 'ok', database: 'connected' });
      } catch (e) {
        next(e);
      }
    },
  );

  app.use('/api/countries', countriesRouter);
  app.use('/api/regions', regionsRouter);

  app.use(errorHandler);

  return app;
}
