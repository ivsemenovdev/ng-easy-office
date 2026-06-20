import { Router } from 'express';

import { pool } from '../db/pool.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { RegionsExportService } from '../services/regions-export.service.js';

const service = new RegionsExportService(pool);
export const regionsExportRouter = Router();

regionsExportRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const buffer = await service.generateDocx();
    const filename = `regions-ru-${new Date().toISOString().slice(0, 10)}.docx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }),
);
