import cors from 'cors';
import express from 'express';

import { pool } from './db/pool.js';
import { config } from './config.js';
import { errorHandler } from './middleware/error-handler.js';
import { countriesRouter } from './routes/countries.routes.js';
import { departmentsRouter } from './routes/departments.routes.js';
import { diagnosticRouter } from './routes/diagnostic.routes.js';
import { equipmentTypesRouter } from './routes/equipment-types.routes.js';
import { hospitalsRouter } from './routes/hospitals.routes.js';
import { regionsExportRouter } from './routes/regions-export.routes.js';
import { regionsRouter } from './routes/regions.routes.js';

/** Собирает Express-приложение: CORS, JSON, `/api/*` роуты, обработчик ошибок. */
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
  app.use('/api/equipment-types', equipmentTypesRouter);
  app.use('/api/departments', departmentsRouter);
  app.use('/api/hospitals', hospitalsRouter);
  app.use('/api/diagnostic', diagnosticRouter);
  app.use('/api/regions/export', regionsExportRouter);
  app.use('/api/regions', regionsRouter);

  app.use(errorHandler);

  return app;
}
