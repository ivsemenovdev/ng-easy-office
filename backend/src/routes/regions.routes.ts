import { Router } from 'express';

import { pool } from '../db/pool.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { RegionsService } from '../services/regions.service.js';
import {
  idParamSchema,
  regionCreateSchema,
  regionListQuerySchema,
  regionUpdateSchema,
} from '../validation.js';

const service = new RegionsService(pool);
export const regionsRouter = Router();

regionsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const query = regionListQuerySchema.parse(req.query);
    const result = await service.list(query);
    res.json(result);
  }),
);

regionsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const item = await service.getById(id);
    res.json(item);
  }),
);

regionsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = regionCreateSchema.parse(req.body);
    const item = await service.create(body);
    res.status(201).json(item);
  }),
);

regionsRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const body = regionUpdateSchema.parse(req.body);
    const item = await service.update(id, body);
    res.json(item);
  }),
);

regionsRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const body = regionUpdateSchema.parse(req.body);
    const item = await service.update(id, body);
    res.json(item);
  }),
);

regionsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    await service.remove(id);
    res.status(204).send();
  }),
);
