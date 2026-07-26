import { Router } from 'express';

import { pool } from '../db/pool.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { EquipmentTypesService } from '../services/equipment-types.service.js';
import {
  equipmentTypeCreateSchema,
  equipmentTypeListQuerySchema,
  equipmentTypeUpdateSchema,
  idParamSchema,
} from '../validation.js';

const service = new EquipmentTypesService(pool);
export const equipmentTypesRouter = Router();

equipmentTypesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const query = equipmentTypeListQuerySchema.parse(req.query);
    const result = await service.list(query);
    res.json(result);
  }),
);

equipmentTypesRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const item = await service.getById(id);
    res.json(item);
  }),
);

equipmentTypesRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = equipmentTypeCreateSchema.parse(req.body);
    const item = await service.create(body);
    res.status(201).json(item);
  }),
);

equipmentTypesRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const body = equipmentTypeUpdateSchema.parse(req.body);
    const item = await service.update(id, body);
    res.json(item);
  }),
);

equipmentTypesRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const body = equipmentTypeUpdateSchema.parse(req.body);
    const item = await service.update(id, body);
    res.json(item);
  }),
);

equipmentTypesRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    await service.remove(id);
    res.status(204).send();
  }),
);
