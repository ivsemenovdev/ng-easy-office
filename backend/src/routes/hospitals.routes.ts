import { Router } from 'express';

import { pool } from '../db/pool.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { HospitalsService } from '../services/hospitals.service.js';
import {
  hospitalCreateSchema,
  hospitalListQuerySchema,
  hospitalUpdateSchema,
  idParamSchema,
} from '../validation.js';

const service = new HospitalsService(pool);
export const hospitalsRouter = Router();

hospitalsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const query = hospitalListQuerySchema.parse(req.query);
    const result = await service.list(query);
    res.json(result);
  }),
);

hospitalsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const item = await service.getById(id);
    res.json(item);
  }),
);

hospitalsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = hospitalCreateSchema.parse(req.body);
    const item = await service.create(body);
    res.status(201).json(item);
  }),
);

hospitalsRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const body = hospitalUpdateSchema.parse(req.body);
    const item = await service.update(id, body);
    res.json(item);
  }),
);

hospitalsRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const body = hospitalUpdateSchema.parse(req.body);
    const item = await service.update(id, body);
    res.json(item);
  }),
);

hospitalsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    await service.remove(id);
    res.status(204).send();
  }),
);
