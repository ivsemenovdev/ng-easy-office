import { Router } from 'express';

import { pool } from '../db/pool.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { EquipmentService } from '../services/equipment.service.js';
import {
  departmentEquipmentIdParamSchema,
  departmentIdParamSchema,
  equipmentCreateSchema,
  equipmentListQuerySchema,
  equipmentUpdateSchema,
} from '../validation.js';

const service = new EquipmentService(pool);
export const departmentsRouter = Router();

departmentsRouter.get(
  '/:departmentId/equipment',
  asyncHandler(async (req, res) => {
    const { departmentId } = departmentIdParamSchema.parse(req.params);
    const query = equipmentListQuerySchema.parse(req.query);
    const result = await service.listByDepartment(departmentId, query);
    res.json(result);
  }),
);

departmentsRouter.get(
  '/:departmentId/equipment/:id',
  asyncHandler(async (req, res) => {
    const { departmentId, id } = departmentEquipmentIdParamSchema.parse(req.params);
    const item = await service.getById(departmentId, id);
    res.json(item);
  }),
);

departmentsRouter.post(
  '/:departmentId/equipment',
  asyncHandler(async (req, res) => {
    const { departmentId } = departmentIdParamSchema.parse(req.params);
    const body = equipmentCreateSchema.parse(req.body);
    const item = await service.create(departmentId, body);
    res.status(201).json(item);
  }),
);

departmentsRouter.put(
  '/:departmentId/equipment/:id',
  asyncHandler(async (req, res) => {
    const { departmentId, id } = departmentEquipmentIdParamSchema.parse(req.params);
    const body = equipmentUpdateSchema.parse(req.body);
    const item = await service.update(departmentId, id, body);
    res.json(item);
  }),
);

departmentsRouter.patch(
  '/:departmentId/equipment/:id',
  asyncHandler(async (req, res) => {
    const { departmentId, id } = departmentEquipmentIdParamSchema.parse(req.params);
    const body = equipmentUpdateSchema.parse(req.body);
    const item = await service.update(departmentId, id, body);
    res.json(item);
  }),
);

departmentsRouter.delete(
  '/:departmentId/equipment/:id',
  asyncHandler(async (req, res) => {
    const { departmentId, id } = departmentEquipmentIdParamSchema.parse(req.params);
    await service.remove(departmentId, id);
    res.status(204).send();
  }),
);
