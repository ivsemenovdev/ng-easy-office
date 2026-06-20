import { Router } from 'express';
import multer from 'multer';

import { pool } from '../db/pool.js';
import { AppError } from '../errors.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { DiagnosticActsService } from '../services/diagnostic-acts.service.js';
import { DiagnosticImportService } from '../services/diagnostic-import.service.js';
import {
  diagnosticActCreateSchema,
  diagnosticActListQuerySchema,
  idParamSchema,
} from '../validation.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed =
      file.mimetype ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.originalname.toLowerCase().endsWith('.docx');
    cb(null, allowed);
  },
});

const parseService = new DiagnosticImportService();
const actsService = new DiagnosticActsService(pool);

export const diagnosticRouter = Router();

diagnosticRouter.post(
  '/parse',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError('Файл не загружен', 400, 'FILE_REQUIRED');
    }

    const result = parseService.parseDocx(req.file.buffer);
    res.json(result);
  }),
);

diagnosticRouter.get(
  '/acts',
  asyncHandler(async (req, res) => {
    const query = diagnosticActListQuerySchema.parse(req.query);
    const result = await actsService.list(query);
    res.json(result);
  }),
);

diagnosticRouter.get(
  '/acts/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const item = await actsService.getById(id);
    res.json(item);
  }),
);

diagnosticRouter.post(
  '/acts',
  asyncHandler(async (req, res) => {
    const body = diagnosticActCreateSchema.parse(req.body);
    const result = await actsService.create(body);
    res.status(201).json(result);
  }),
);
