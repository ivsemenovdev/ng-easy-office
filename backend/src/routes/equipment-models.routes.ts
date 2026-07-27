import { Router } from 'express';

import { pool } from '../db/pool.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { EquipmentModelsService } from '../services/equipment-models.service.js';
import {
  equipmentModelCreateSchema,
  equipmentModelListQuerySchema,
  equipmentModelUpdateSchema,
  idParamSchema,
} from '../validation.js';

const service = new EquipmentModelsService(pool);
export const equipmentModelsRouter = Router();

equipmentModelsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const query = equipmentModelListQuerySchema.parse(req.query);
    const result = await service.list(query);
    res.json(result);
  }),
);

equipmentModelsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const item = await service.getById(id);
    res.json(item);
  }),
);

equipmentModelsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = equipmentModelCreateSchema.parse(req.body);
    const item = await service.create(body);
    res.status(201).json(item);
  }),
);

equipmentModelsRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const body = equipmentModelUpdateSchema.parse(req.body);
    const item = await service.update(id, body);
    res.json(item);
  }),
);

equipmentModelsRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const body = equipmentModelUpdateSchema.parse(req.body);
    const item = await service.update(id, body);
    res.json(item);
  }),
);

equipmentModelsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    await service.remove(id);
    res.status(204).send();
  }),
);
